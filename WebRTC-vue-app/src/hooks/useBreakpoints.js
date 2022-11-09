import { computed, onMounted, onUnmounted, ref } from 'vue';

export default function useBreakpoints() {
  let windowWidth = ref(window.innerWidth);

  const onWidthChange = () => (windowWidth.value = window.innerWidth);
  onMounted(() => window.addEventListener('resize', onWidthChange));
  onUnmounted(() => window.removeEventListener('resize', onWidthChange));

  const type = computed(() => {
    if (windowWidth.value <= 640) return 'xs';
    if (windowWidth.value <= 768) return 'md';
    if (windowWidth.value <= 1024) return 'lg';
    if (windowWidth.value <= 1280) return 'xl';
    return '2xl'; // This is an unreachable line, simply to keep eslint happy.
  });

  const width = computed(() => windowWidth.value);

  return { width, type };
}
