import { ref, watchEffect } from 'vue';

export default function useScreenFit() {
  const totalWidth = ref(null);
  const totalHeight = ref(null);
  const streamCount = ref(null);
  const aspectRatio = ref(null);
  const maxWidth = ref(0);
  const maxHeight = ref(0);
  const areaFits = ({ possibleWidth }) => {
    let totalHeightNeeded;

    const streamsPerRow = Math.floor(totalWidth.value / possibleWidth);
    const rowsNeeded = Math.ceil(streamCount.value / streamsPerRow);
    if (rowsNeeded > 0) {
      totalHeightNeeded = rowsNeeded * possibleWidth * aspectRatio.value;
    } else {
      totalHeightNeeded = possibleWidth * aspectRatio.value;
    }
    return totalHeightNeeded < totalHeight.value;
  };

  const caculateMaxWidth = () => {
    let max = 0;
    // binary search for maximal width in  [50, 5000]
    for (let lower = 50, upper = 5000; lower < upper; ) {
      max = Math.floor((upper + lower) / 2);
      if (max === lower) {
        break;
      }
      if (
        areaFits({
          possibleWidth: max,
        })
      ) {
        lower = max;
      } else {
        upper = max;
      }
    }
    return max - 5;
  };
  watchEffect(() => {
    if (
      totalWidth.value &&
      totalHeight.value &&
      streamCount.value &&
      aspectRatio.value
    ) {
      maxWidth.value = caculateMaxWidth();
      maxHeight.value = maxWidth.value * aspectRatio.value;
    }
  });
  const setTotalSize = ({ TotalWidth, TotalHeight }) => {
    totalWidth.value = TotalWidth;
    totalHeight.value = TotalHeight;
  };
  const setStreamState = ({ AspectRatio, StreamCount }) => {
    aspectRatio.value = AspectRatio;
    streamCount.value = StreamCount;
  };
  return { maxWidth, maxHeight, setTotalSize, setStreamState };
}
