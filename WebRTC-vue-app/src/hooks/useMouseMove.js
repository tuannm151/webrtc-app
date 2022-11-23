import { onMounted, onUnmounted } from 'vue';

export default function useMouseMove({
  handler,
  clearTimer = true,
  delay = 3000,
}) {
  let timer = null;
  const onMouseMove = () => {
    if (clearTimer) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handler();
      }, delay);
    }
    handler();
  };

  onMounted(() => {
    document.addEventListener('mousemove', onMouseMove);
  });

  onUnmounted(() => {
    document.removeEventListener('mousemove', onMouseMove);
  });
}
