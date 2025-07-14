<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * @return \Illuminate\View\View
     */
    public function edit()
    {
        $user = Auth::user();
    
        $notesCount = $user->notes()
            ->where('is_deleted', false)
            ->count();
            
        $foldersCount = $user->folders()
            ->where('is_deleted', false)
            ->count();
        
        $recentNotes = $user->notes()
            ->select('created_at')
            ->where('is_deleted', false)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        $notesWithFiles = $user->notes()
            ->where('is_deleted', false)
            ->whereNotNull('files')
            ->where('files', '!=', '[]')
            ->count();
        
        return view('profile.edit', [
            'user' => $user,
            'notesCount' => $notesCount,
            'foldersCount' => $foldersCount,
            'recentNotes' => $recentNotes,
            'notesWithFiles' => $notesWithFiles,
        ]);
    }
    
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $messages = [
            'name.required' => 'Пожалуйста, введите ваше имя',
            'name.max' => 'Имя не должно превышать 255 символов',
            'username.required' => 'Пожалуйста, введите ваш логин',
            'username.min' => 'Логин должен содержать минимум 3 символа',
            'username.max' => 'Логин не должен превышать 30 символов',
            'username.unique' => 'Этот логин уже занят',
            'username.regex' => 'Логин может содержать только буквы, цифры и символы подчеркивания',
            'email.required' => 'Пожалуйста, введите ваш email',
            'email.email' => 'Пожалуйста, введите корректный email адрес',
            'email.unique' => 'Этот email уже зарегистрирован',
            'avatar.image' => 'Аватар должен быть изображением',
            'avatar.mimes' => 'Поддерживаемые форматы: jpeg, png, jpg, gif',
            'avatar.max' => 'Размер изображения не должен превышать 5MB',
        ];

        $user = Auth::user();
        
        if ($request->hasFile('avatar') && $request->ajax()) {
            try {
                $request->validate([
                    'avatar' => [
                        'required',
                        'image',
                        'mimes:jpeg,png,jpg,gif',
                        'max:5120',
                    ],
                ], $messages);
                
                if ($user->avatar && $user->avatar !== 'default-avatar.png') {
                    Storage::disk('public')->delete('avatars/' . $user->avatar);
                }
                
                if (!Storage::disk('public')->exists('avatars')) {
                    Storage::disk('public')->makeDirectory('avatars');
                }
                
                $avatarName = $user->id . '_' . time() . '.' . $request->avatar->extension();
                $path = $request->avatar->storeAs('avatars', $avatarName, 'public');
                
                if (!Storage::disk('public')->exists('avatars/' . $avatarName)) {
                    throw new \Exception('Не удалось сохранить файл аватара');
                }
                
                $user->avatar = $avatarName;
                $user->save();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Аватар успешно обновлен',
                    'avatar_url' => $user->avatar_url
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при загрузке аватара: ' . $e->getMessage()
                ], 422);
            }
        }
        
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-zA-Z0-9_]+$/',
                'unique:users,username,' . $user->id,
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email,' . $user->id,
            ],
            'avatar' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:5120',
            ],
        ], $messages);

        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;
        
        if ($request->hasFile('avatar')) {
            if ($user->avatar && $user->avatar !== 'default-avatar.png') {
                Storage::disk('public')->delete('avatars/' . $user->avatar);
            }
            
            if (!Storage::disk('public')->exists('avatars')) {
                Storage::disk('public')->makeDirectory('avatars');
            }
            
            $avatarName = $user->id . '_' . time() . '.' . $request->avatar->extension();
            $path = $request->avatar->storeAs('avatars', $avatarName, 'public');
            
            if (!Storage::disk('public')->exists('avatars/' . $avatarName)) {
                return back()->with('error', 'Не удалось сохранить файл аватара');
            }
            
            $user->avatar = $avatarName;
        }
        
        if ($request->has('theme_preference')) {
            $user->theme_preference = $request->theme_preference;
        }
        
        $user->save();
        
        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Профиль успешно обновлен'
            ]);
        }

        return back()->with('status', 'Профиль успешно обновлен');
    }
    
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        $messages = [
            'current_password.required' => 'Пожалуйста, введите текущий пароль',
            'password.required' => 'Пожалуйста, введите новый пароль',
            'password.confirmed' => 'Пароли не совпадают',
            'password.min' => 'Пароль должен содержать минимум 8 символов',
            'password.regex' => 'Пароль должен содержать как минимум одну заглавную букву, одну строчную букву и одну цифру',
        ];

        try {
            $request->validate([
                'current_password' => ['required'],
                'password' => [
                    'required',
                    'confirmed',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
                ],
            ], $messages);

            $user = Auth::user();

            if (!Hash::check($request->current_password, $user->password)) {
                if ($request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Текущий пароль неверен',
                        'errors' => [
                            'current_password' => ['Текущий пароль неверен']
                        ]
                    ], 422);
                }
                
                throw ValidationException::withMessages([
                    'current_password' => ['Текущий пароль неверен.'],
                ]);
            }

            $user->password = Hash::make($request->password);
            $user->save();
            
            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Пароль успешно изменен'
                ]);
            }

            return back()->with('status', 'Пароль успешно изменен');
            
        } catch (ValidationException $e) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации',
                    'errors' => $e->errors()
                ], 422);
            }
            
            throw $e;
        }
    }
    
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required'],
        ], [
            'password.required' => 'Для удаления аккаунта необходимо ввести пароль',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->password, $user->password)) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Неверный пароль'
                ]);
            }
            
            return back()->withErrors([
                'password' => 'Неверный пароль',
            ]);
        }

        $user->notes()->delete();
        $user->folders()->delete();
        
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        $user->delete();
        
        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'redirect' => '/login',
                'message' => 'Аккаунт был успешно удален.'
            ]);
        }

        return redirect('/login')->with('status', 'Аккаунт был успешно удален.');
    }
    
    /**
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeAvatar()
    {
        $user = Auth::user();
        
        if ($user->avatar && $user->avatar !== 'default-avatar.png') {
            Storage::disk('public')->delete('avatars/' . $user->avatar);
        }
        
        $user->avatar = 'default-avatar.png';
        $user->save();
        
        return back()->with('status', 'Аватар успешно удален');
    }
    
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updatePreferences(Request $request)
    {
        $user = Auth::user();
        
        $user->theme_preference = $request->theme_preference;
        $user->notification_preference = $request->notification_preference ? true : false;
        $user->save();
        
        if ($request->ajax()) {
            return response()->json(['success' => true]);
        }
        
        return back()->with('status', 'Настройки успешно обновлены');
    }
    
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkUsername(Request $request)
    {
        $username = $request->input('username');
        $userId = $request->input('user_id');
        
        $isAvailable = \App\Models\User::where('username', $username)
            ->where('id', '!=', $userId)
            ->doesntExist();
        
        return response()->json(['available' => $isAvailable]);
    }
    
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkEmail(Request $request)
    {
        $email = $request->input('email');
        $userId = $request->input('user_id');
        
        $isAvailable = \App\Models\User::where('email', $email)
            ->where('id', '!=', $userId)
            ->doesntExist();
        
        return response()->json(['available' => $isAvailable]);
    }
    
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function ajaxUpdateTheme(Request $request)
    {
        $user = Auth::user();
        $user->theme_preference = $request->input('theme_preference');
        $user->save();
        
        return response()->json(['success' => true]);
    }
}