<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('coleadores', \App\Http\Controllers\Admin\ColeadorController::class);
        Route::resource('championships', \App\Http\Controllers\Admin\ChampionshipController::class);
        Route::get('championships/{championship}/scores', [\App\Http\Controllers\Admin\ScoreController::class, 'index'])->name('championships.scores.index');
        Route::get('championships/{championship}/scores/create', [\App\Http\Controllers\Admin\ScoreController::class, 'create'])->name('championships.scores.create');
        Route::post('championships/{championship}/scores', [\App\Http\Controllers\Admin\ScoreController::class, 'store'])->name('championships.scores.store');

        Route::resource('championships.entries', \App\Http\Controllers\Admin\EntryController::class);
        Route::post('championships/{championship}/entries/check-combination', [\App\Http\Controllers\Admin\EntryController::class, 'checkCombination'])->name('championships.entries.check');

        Route::resource('customers', \App\Http\Controllers\Admin\CustomerController::class);
        Route::resource('payments', \App\Http\Controllers\Admin\PaymentController::class);
        Route::resource('rounds', \App\Http\Controllers\Admin\RoundController::class);

        // Individual score management can still exist but index and create are now scoped
        Route::resource('scores', \App\Http\Controllers\Admin\ScoreController::class)->except(['index', 'create', 'store']);
    });
});

require __DIR__.'/auth.php';
