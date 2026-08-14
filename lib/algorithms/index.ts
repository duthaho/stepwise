import { Algorithm } from "../trace";
import { bubbleSort } from "./bubble";
import { insertionSort } from "./insertion";
import { selectionSort } from "./selection";
import { mergeSort } from "./merge";
import { quickSort } from "./quick";
import { linearSearch } from "./linear-search";
import { binarySearch } from "./binary-search";
import { lowerBound } from "./lower-bound";

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
