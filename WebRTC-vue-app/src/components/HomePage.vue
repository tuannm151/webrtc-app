<template>
  <div class="mockup-window border bg-base-300 w-4/5 h-4/5">
    <div class="flex justify-center px-4 py-16 bg-base-200 h-full bg-gray-700">
      <div class="flex flex-col gap-8 mt-10">
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text text-white">Nhập tên của bạn</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        <button class="btn btn-outline btn-warning">Tạo phòng mới</button>
        <button class="btn btn-outline btn-warning">Tham gia phòng</button>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
