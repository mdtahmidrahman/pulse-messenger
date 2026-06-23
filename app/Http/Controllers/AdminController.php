<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function approvals()
    {
        $pendingUsers = User::whereNull('approved_at')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Approvals', [
            'pendingUsers' => $pendingUsers
        ]);
    }
}
