<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                try {
                    cloudinary()->destroy($user->avatar);
                } catch (\Exception $e) {
                    \Log::error('Failed to delete old avatar from Cloudinary: ' . $e->getMessage());
                }
            }
            
            // Store new avatar
            $uploadedFile = cloudinary()->upload($request->file('avatar')->getRealPath(), [
                'folder' => 'avatars'
            ]);
            $validated['avatar'] = $uploadedFile->getSecurePath();
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Remove the user's avatar.
     */
    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            try {
                // Extract public ID from Cloudinary URL (e.g., avatars/filename)
                $urlParts = explode('/upload/', $user->avatar);
                if (count($urlParts) > 1) {
                    $pathParts = explode('/', $urlParts[1]);
                    // Remove version number (v1234) if present
                    if (preg_match('/^v\d+$/', $pathParts[0])) {
                        array_shift($pathParts);
                    }
                    $publicIdWithExt = implode('/', $pathParts);
                    $publicId = pathinfo($publicIdWithExt, PATHINFO_FILENAME);
                    
                    cloudinary()->uploadApi()->destroy($publicId);
                }
            } catch (\Throwable $e) {
                \Log::error('Failed to delete avatar from Cloudinary: ' . $e->getMessage());
            }
            $user->avatar = null;
            $user->save();
        }

        return Redirect::route('profile.edit')->with('status', 'avatar-removed');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
