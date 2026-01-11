<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            // Admin
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'phone' => '0900000000',
                'password' => Hash::make('123456'),
                'avatar' => null,
                'role' => 'admin',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Customer 1
            [
                'name' => 'Nguyễn Văn A',
                'email' => 'user1@gmail.com',
                'phone' => '0911111111',
                'password' => Hash::make('123456'),
                'avatar' => null,
                'role' => 'customer',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Customer 2
            [
                'name' => 'Trần Thị B',
                'email' => 'user2@gmail.com',
                'phone' => '0922222222',
                'password' => Hash::make('123456'),
                'avatar' => null,
                'role' => 'customer',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
