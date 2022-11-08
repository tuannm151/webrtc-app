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
    <div class="flex flex-col px-4 pb-5 h-[120px] justify-end">
      <div
        class="flex gap-1 border-2 border-slate-500 py-2 px-3 rounded-lg items-center bg-[#1e2131]"
        @keyup.enter="handleSendChatMessage"
      >
        <textarea
          ref="textarea"
          v-model="message"
          type="text"
          placeholder="Nhập tin nhắn"
          class="w-full max-w-xs bg-transparent text-white outline-none max-h-[100px] min-h-6 h-6 resize-none text-sm overflow-hidden"
          @keypress="autoGrow"
        />
        <button @click="handleSendChatMessage">
          <SendIcon style="font-size: 16px; color: white" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUpdated, ref } from 'vue';
import SendIcon from '~icons/mdi/send';
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

const emit = defineEmits(['send-message']);

const autoGrow = () => {
  textarea.value.style.height = 0;
  textarea.value.style.height = textarea.value.scrollHeight + 'px';
};

const handleSendChatMessage = () => {
  if (message.value.trim() === '') {
    return;
  }
  emit('send-message', message.value);
  message.value = '';
  textarea.value.style.height = 0;
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
