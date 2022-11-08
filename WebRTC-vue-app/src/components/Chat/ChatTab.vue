<template>
  <div
    class="w-[350px] flex-shrink-0 h-full px-1 pt-7 flex flex-col bg-[#1e2131]"
  >
    <div
      ref="msgContainer"
      class="flex flex-col gap-5 flex-1 w-full pt-3 overflow-auto px-4 pb-6 scrollbar"
    >
      <MessageGroup
        v-for="(msg, index) in messages"
        :key="index"
        :message="msg"
        :sending="msg?.isLocal === true"
      />
    </div>
    <div
      class="flex relative flex-col gap-2 px-4 mb-8 h-[120px] justify-end bg-[#1e2131]"
    >
      <EmojiPicker
        v-if="pickerOn"
        @close-picker="togglePicker"
        @select-emoji="handleSelectEmoji"
      />
      <div class="flex justify-between">
        <div class="flex gap-2">
          <button
            @click.stop="togglePicker"
            class="text-gray-400 hover:text-gray-200"
          >
            <StickerIcon style="height: 20px; width: 20px" />
          </button>
          <button class="text-gray-400 hover:text-gray-200">
            <ImageAddIcon style="height: 20px; width: 20px" />
          </button>
          <button class="text-gray-400 hover:text-gray-200">
            <AttachIcon style="height: 20px; width: 20px" />
          </button>
        </div>
      </div>
      <div
        class="flex gap-1 border-2 border-slate-500 py-2 px-3 rounded-md items-center"
      >
        <textarea
          ref="textarea"
          v-model="message"
          type="text"
          placeholder="Nhập tin nhắn"
          class="w-full max-w-xs bg-transparent text-white outline-none max-h-[100px] min-h-6 h-6 resize-none text-sm overflow-hidden"
          @keypress="inputHandler"
        />
        <button @click="sendChatMessage">
          <SendIcon style="font-size: 16px; color: white" />
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
