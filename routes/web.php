<?php
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Test route to verify routing works
Route::get('/broadcasting/test', function () {
    error_log('=== BROADCAST TEST ROUTE HIT ===');
    return response()->json(['status' => 'ok', 'user' => auth()->id()]);
})->middleware(['web']);

// Broadcasting auth route
Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate'])
    ->middleware(['web', 'auth'])
    ->withoutMiddleware([\App\Http\Middleware\HandleInertiaRequests::class]);

Route::middleware(['auth', 'verified'])->group(function()
{
    Route::get('/', [HomeController::class, 'home'])->name('home');

    Route::get('/user/{user}', [MessageController::class, 'byuser'])->name('chat.user');
    Route::get('/group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');

    Route::post('/message', [MessageController::class, 'store'])->name('message.store');
    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
    Route::get('/load-older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');
    Route::get('/message/attachment/{attachment}', [MessageController::class, 'downloadAttachment'])->name('message.downloadAttachment');

    Route::middleware(['admin'])->group(function(){
        Route::post('/user', [UserController::class, 'store'])->name('user.store');
        Route::post('/user/change-role/{user}', [UserController::class, 'changeRole'])->name('user.changeRole');
        Route::post('/user/block-unblock/{user}', [UserController::class, 'blockUnblock'])->name('user.blockUnblock');
    });
});

Route::middleware('auth')->group(function()
{
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



require __DIR__.'/auth.php';
