<?php
<<<<<<< HEAD
use App\Http\Controllers\AdminController;
=======
>>>>>>> 5a1496a (Add custom broadcasting auth controller with logging)
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PushSubscriptionController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\HandleInertiaRequests;

// Test route to verify routing works
Route::get('/broadcasting/test', function () {
    error_log('=== BROADCAST TEST ROUTE HIT ===');
    return response()->json(['status' => 'ok', 'user' => auth()->id()]);
})->middleware(['web']);

// Broadcasting auth route
Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate'])
    ->middleware(['web', 'auth'])
    ->withoutMiddleware([HandleInertiaRequests::class]);

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('home');
    }

    return \Inertia\Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'isLoggedIn' => false,
    ]);
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function()
{
    Route::get('/chat', [HomeController::class, 'home'])->name('home');

    Route::get('/user/{user}', [MessageController::class, 'byuser'])->name('chat.user');
    Route::get('/group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');

    Route::post('/message', [MessageController::class, 'store'])->name('message.store');
    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
    Route::get('/load-older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');
    Route::get('/message/attachment/{attachment}', [MessageController::class, 'downloadAttachment'])->name('message.downloadAttachment');
    Route::patch('/message/{message}', [MessageController::class, 'update'])->name('message.update');
    Route::post('/message/forward', [MessageController::class, 'forward'])->name('message.forward');

    Route::middleware(['admin'])->group(function(){
        Route::get('/admin/approvals', [AdminController::class, 'approvals'])->name('admin.approvals');
        
        Route::post('/user', [UserController::class, 'store'])->name('user.store');
        Route::post('/user/change-role/{user}', [UserController::class, 'changeRole'])->name('user.changeRole');
        Route::post('/user/block-unblock/{user}', [UserController::class, 'blockUnblock'])->name('user.blockUnblock');
        Route::post('/user/approve/{user}', [UserController::class, 'approve'])->name('user.approve');
        Route::post('/user/decline/{user}', [UserController::class, 'decline'])->name('user.decline');
    });
});

Route::middleware('auth')->group(function()
{
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar'])->name('profile.avatar.destroy');

    // Push subscriptions
    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store'])->name('push.subscribe');
    Route::post('/push-subscriptions/delete', [PushSubscriptionController::class, 'destroy'])->name('push.unsubscribe');
});



require __DIR__.'/auth.php';
