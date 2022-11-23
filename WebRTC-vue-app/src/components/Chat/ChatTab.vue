<template>
  <div
    class="flex-shrink-0 h-full px-1 pt-7 flex flex-col relative pb-10 md:pb-0 w-full md:w-[350px] text-base-content"
  >
    <TheBackground classes="bg-base-100 brightness-125" />
    <div
      ref="msgContainer"
      class="flex z-10 flex-col gap-5 flex-1 w-full pt-3 overflow-auto px-4 pb-6 scrollbar"
    >
      <MessageGroup
        v-for="(msg, index) in messages"
        :key="index"
        :message="msg"
        :sending="msg?.isLocal === true"
      />
    </div>
    <div class="flex relative flex-col gap-2 px-4 mb-8 h-[120px] justify-end">
      <TheBackground classes="bg-base-200 brightness-125 -z-10" />
      <EmojiPicker
        @close-picker="togglePicker"
        @select-emoji="handleSelectEmoji"
        :isActive="pickerOn"
      />
      <div class="flex justify-between">
        <div class="flex gap-2">
          <button @click.stop="togglePicker" class="text-accent-focus">
            <StickerIcon style="height: 20px; width: 20px" />
          </button>
          <button class="text-accent-focus">
            <ImageAddIcon style="height: 20px; width: 20px" />
          </button>
          <button class="text-accent-focus">
            <AttachIcon style="height: 20px; width: 20px" />
          </button>
        </div>
      </div>
      <div
        class="flex gap-1 border-2 border-accent border-opacity-70 py-2 px-3 rounded-md items-center"
      >
        <textarea
          ref="textarea"
          v-model="message"
          type="text"
          placeholder="Nhập tin nhắn"
          class="w-full flex-1 bg-transparent outline-none max-h-[100px] min-h-6 h-6 resize-none text-sm overflow-hidden font-medium"
          @keypress="inputHandler"
        />
        <button @click="sendChatMessage">
          <SendIcon style="font-size: 16px" class="text-accent-focus" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import EmojiPicker from './EmojiPicker.vue';
import { onMounted, onUpdated, ref } from 'vue';
import SendIcon from '~icons/mdi/send';
import StickerIcon from '~icons/mdi/sticker-emoji';
import ImageAddIcon from '~icons/mdi/file-image-plus';
import AttachIcon from '~icons/mdi/attachment';
import MessageGroup from './MessageGroup.vue';
import TheBackground from '../Utils/TheBackground.vue';

defineProps({
  messages: {
    type: Array,
    required: true,
  },
});

const textarea = ref(null);
const message = ref('');
const msgContainer = ref(null);
const pickerOn = ref(false);

const emit = defineEmits(['send-message']);

const autoGrow = () => {
  textarea.value.style.height = '0';
  textarea.value.style.height = textarea.value.scrollHeight + 'px';
};

const inputHandler = (event) => {
  if (event.keyCode === 13 && !event.shiftKey) {
    sendChatMessage();
    textarea.value.style.height = '0';
    event.preventDefault();
  }

  autoGrow();
};

const sendChatMessage = () => {
  if (message.value.trim() === '') return;

  emit('send-message', message.value);
  message.value = '';
  textarea.value.style.height = 0;
};

const togglePicker = (e) => {
  if (e) {
    e.stopPropagation();
  }
  pickerOn.value = !pickerOn.value;
};

const handleSelectEmoji = (e) => {
  message.value += e.emoji;
  autoGrow();
};

onMounted(() => {
  msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
});

onUpdated(() => {
  msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
});
</script>

<style lang="scss" scoped>
textarea::-webkit-scrollbar {
  width: 2px;
}

textarea::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

textarea::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 1px solid slategrey;
}

.scrollbar::-webkit-scrollbar {
  width: 2px;
  background-color: #1e2131;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(146, 146, 146);
}
</style>
