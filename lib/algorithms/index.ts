import { Algorithm } from "../trace";
import { bubbleSort } from "./bubble";
import { insertionSort } from "./insertion";
import { selectionSort } from "./selection";
import { mergeSort } from "./merge";
import { quickSort } from "./quick";

export const SORTING_ALGORITHMS: Algorithm[] = [
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
];
