<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserApproved;
use App\Mail\UserDeclined;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => ['required', 'email', 'unique:users,email'],
            'is_admin' => 'boolean',
        ]);
        // Generate and assign a random password
        $rawPassword = Str::random(8);
        $data['password' ] = bcrypt($rawPassword);
        $data['email_verified_at']= now();
        $data['approved_at'] = now();

        $user = User::create($data);

        \Illuminate\Support\Facades\Mail::to($user->email)->queue(new \App\Mail\UserCreatedMail($user, $rawPassword));

        return redirect()->back();
    } 

    public function changeRole(User $user)
    {
        $user->update(['is_admin' => !(bool) $user->is_admin]);

        $message = "User role was changed into " . ($user->is_admin ? '"Admin"' : '"Regular User"');

        return response()->json(['message' => $message]);   
    }

    public function blockUnblock(User $user)
    {
        if ($user->blocked_at) {
            $user->blocked_at = null;
            $message = 'User account has been activated';
        } else {
            $user->blocked_at = now();
            $message = 'User account has been blocked';
        }
        
        $user->save();
        
        return response()->json(['message' => $message]);
    }

    public function approve(User $user)
    {
        $user->approved_at = now();
        $user->save();

        Mail::to($user->email)->queue(new UserApproved($user->name));

        return response()->json(['message' => 'User has been approved.']);
    }

    public function decline(User $user)
    {
        $userName = $user->name;
        $userEmail = $user->email;
        $user->delete();

        Mail::to($userEmail)->queue(new UserDeclined($userName));

        return response()->json(['message' => 'User request has been declined and removed.']);
    }
}
