import { Algorithm } from "../trace";
import { bubbleSort } from "./bubble";
import { insertionSort } from "./insertion";
import { selectionSort } from "./selection";
import { mergeSort } from "./merge";
import { quickSort } from "./quick";
import { linearSearch } from "./linear-search";
import { binarySearch } from "./binary-search";
import { lowerBound } from "./lower-bound";
import { nextGreater } from "./next-greater";
import { windowMax } from "./window-max";
import { histogramRect } from "./histogram-rect";
import { reverseList } from "./reverse-list";
import { middleList } from "./middle-list";
import { cycleDetect } from "./cycle-detect";

export const SORTING_ALGORITHMS: Algorithm[] = [
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
];

export const SEARCHING_ALGORITHMS: Algorithm[] = [
  linearSearch,
  binarySearch,
  lowerBound,
];

export const STACK_ALGORITHMS: Algorithm[] = [
  nextGreater,
  windowMax,
  histogramRect,
];

export const LIST_ALGORITHMS: Algorithm[] = [
  reverseList,
  middleList,
  cycleDetect,
];
