# AI Pokémon Level Scaling (Floors 1–4000)

Formula from `getLevelScaling`:
- **Normal floor:** `level = floor((effectiveFloor - 1) / 2) + 3`
- **Boss floor** (every 10th): uses `effectiveFloor = floor - 1`, then `level += 1`
- **Post-boss protection:** If the calculated level is less than or equal to the previous boss's level, `level = prevBossLevel + 1`

| Floor | Level | Type |
|------:|------:|------|
| 1 | 3 | Normal |
| 2 | 3 | Normal |
| 3 | 4 | Normal |
| 4 | 4 | Normal |
| 5 | 5 | Normal |
| 6 | 5 | Normal |
| 7 | 6 | Normal |
| 8 | 6 | Normal |
| 9 | 7 | Normal |
| 10 | 8 | ️ Boss |
| 11 | 9 | Post-Boss |
| 12 | 9 | Normal (Protected) |
| 13 | 9 | Normal |
| 14 | 9 | Normal |
| 15 | 10 | Normal |
| 16 | 10 | Normal |
| 17 | 11 | Normal |
| 18 | 11 | Normal |
| 19 | 12 | Normal |
| 20 | 13 | ️ Boss |
| 21 | 14 | Post-Boss |
| 22 | 14 | Normal (Protected) |
| 23 | 14 | Normal |
| 24 | 14 | Normal |
| 25 | 15 | Normal |
| 26 | 15 | Normal |
| 27 | 16 | Normal |
| 28 | 16 | Normal |
| 29 | 17 | Normal |
| 30 | 18 | ️ Boss |
| 31 | 19 | Post-Boss |
| 32 | 19 | Normal (Protected) |
| 33 | 19 | Normal |
| 34 | 19 | Normal |
| 35 | 20 | Normal |
| 36 | 20 | Normal |
| 37 | 21 | Normal |
| 38 | 21 | Normal |
| 39 | 22 | Normal |
| 40 | 23 | ️ Boss |
| 41 | 24 | Post-Boss |
| 42 | 24 | Normal (Protected) |
| 43 | 24 | Normal |
| 44 | 24 | Normal |
| 45 | 25 | Normal |
| 46 | 25 | Normal |
| 47 | 26 | Normal |
| 48 | 26 | Normal |
| 49 | 27 | Normal |
| 50 | 28 | ️ Boss |
| 51 | 29 | Post-Boss |
| 52 | 29 | Normal (Protected) |
| 53 | 29 | Normal |
| 54 | 29 | Normal |
| 55 | 30 | Normal |
| 56 | 30 | Normal |
| 57 | 31 | Normal |
| 58 | 31 | Normal |
| 59 | 32 | Normal |
| 60 | 33 | ️ Boss |
| 61 | 34 | Post-Boss |
| 62 | 34 | Normal (Protected) |
| 63 | 34 | Normal |
| 64 | 34 | Normal |
| 65 | 35 | Normal |
| 66 | 35 | Normal |
| 67 | 36 | Normal |
| 68 | 36 | Normal |
| 69 | 37 | Normal |
| 70 | 38 | ️ Boss |
| 71 | 39 | Post-Boss |
| 72 | 39 | Normal (Protected) |
| 73 | 39 | Normal |
| 74 | 39 | Normal |
| 75 | 40 | Normal |
| 76 | 40 | Normal |
| 77 | 41 | Normal |
| 78 | 41 | Normal |
| 79 | 42 | Normal |
| 80 | 43 | ️ Boss |
| 81 | 44 | Post-Boss |
| 82 | 44 | Normal (Protected) |
| 83 | 44 | Normal |
| 84 | 44 | Normal |
| 85 | 45 | Normal |
| 86 | 45 | Normal |
| 87 | 46 | Normal |
| 88 | 46 | Normal |
| 89 | 47 | Normal |
| 90 | 48 | ️ Boss |
| 91 | 49 | Post-Boss |
| 92 | 49 | Normal (Protected) |
| 93 | 49 | Normal |
| 94 | 49 | Normal |
| 95 | 50 | Normal |
| 96 | 50 | Normal |
| 97 | 51 | Normal |
| 98 | 51 | Normal |
| 99 | 52 | Normal |
| 100 | 53 | ️ Boss |
| 101 | 54 | Post-Boss |
| 102 | 54 | Normal (Protected) |
| 103 | 54 | Normal |
| 104 | 54 | Normal |
| 105 | 55 | Normal |
| 106 | 55 | Normal |
| 107 | 56 | Normal |
| 108 | 56 | Normal |
| 109 | 57 | Normal |
| 110 | 58 | ️ Boss |
| 111 | 59 | Post-Boss |
| 112 | 59 | Normal (Protected) |
| 113 | 59 | Normal |
| 114 | 59 | Normal |
| 115 | 60 | Normal |
| 116 | 60 | Normal |
| 117 | 61 | Normal |
| 118 | 61 | Normal |
| 119 | 62 | Normal |
| 120 | 63 | ️ Boss |
| 121 | 64 | Post-Boss |
| 122 | 64 | Normal (Protected) |
| 123 | 64 | Normal |
| 124 | 64 | Normal |
| 125 | 65 | Normal |
| 126 | 65 | Normal |
| 127 | 66 | Normal |
| 128 | 66 | Normal |
| 129 | 67 | Normal |
| 130 | 68 | ️ Boss |
| 131 | 69 | Post-Boss |
| 132 | 69 | Normal (Protected) |
| 133 | 69 | Normal |
| 134 | 69 | Normal |
| 135 | 70 | Normal |
| 136 | 70 | Normal |
| 137 | 71 | Normal |
| 138 | 71 | Normal |
| 139 | 72 | Normal |
| 140 | 73 | ️ Boss |
| 141 | 74 | Post-Boss |
| 142 | 74 | Normal (Protected) |
| 143 | 74 | Normal |
| 144 | 74 | Normal |
| 145 | 75 | Normal |
| 146 | 75 | Normal |
| 147 | 76 | Normal |
| 148 | 76 | Normal |
| 149 | 77 | Normal |
| 150 | 78 | ️ Boss |
| 151 | 79 | Post-Boss |
| 152 | 79 | Normal (Protected) |
| 153 | 79 | Normal |
| 154 | 79 | Normal |
| 155 | 80 | Normal |
| 156 | 80 | Normal |
| 157 | 81 | Normal |
| 158 | 81 | Normal |
| 159 | 82 | Normal |
| 160 | 83 | ️ Boss |
| 161 | 84 | Post-Boss |
| 162 | 84 | Normal (Protected) |
| 163 | 84 | Normal |
| 164 | 84 | Normal |
| 165 | 85 | Normal |
| 166 | 85 | Normal |
| 167 | 86 | Normal |
| 168 | 86 | Normal |
| 169 | 87 | Normal |
| 170 | 88 | ️ Boss |
| 171 | 89 | Post-Boss |
| 172 | 89 | Normal (Protected) |
| 173 | 89 | Normal |
| 174 | 89 | Normal |
| 175 | 90 | Normal |
| 176 | 90 | Normal |
| 177 | 91 | Normal |
| 178 | 91 | Normal |
| 179 | 92 | Normal |
| 180 | 93 | ️ Boss |
| 181 | 94 | Post-Boss |
| 182 | 94 | Normal (Protected) |
| 183 | 94 | Normal |
| 184 | 94 | Normal |
| 185 | 95 | Normal |
| 186 | 95 | Normal |
| 187 | 96 | Normal |
| 188 | 96 | Normal |
| 189 | 97 | Normal |
| 190 | 98 | ️ Boss |
| 191 | 99 | Post-Boss |
| 192 | 99 | Normal (Protected) |
| 193 | 99 | Normal |
| 194 | 99 | Normal |
| 195 | 100 | Normal |
| 196 | 100 | Normal |
| 197 | 101 | Normal |
| 198 | 101 | Normal |
| 199 | 102 | Normal |
| 200 | 103 | ️ Boss |
| 201 | 104 | Post-Boss |
| 202 | 104 | Normal (Protected) |
| 203 | 104 | Normal |
| 204 | 104 | Normal |
| 205 | 105 | Normal |
| 206 | 105 | Normal |
| 207 | 106 | Normal |
| 208 | 106 | Normal |
| 209 | 107 | Normal |
| 210 | 108 | ️ Boss |
| 211 | 109 | Post-Boss |
| 212 | 109 | Normal (Protected) |
| 213 | 109 | Normal |
| 214 | 109 | Normal |
| 215 | 110 | Normal |
| 216 | 110 | Normal |
| 217 | 111 | Normal |
| 218 | 111 | Normal |
| 219 | 112 | Normal |
| 220 | 113 | ️ Boss |
| 221 | 114 | Post-Boss |
| 222 | 114 | Normal (Protected) |
| 223 | 114 | Normal |
| 224 | 114 | Normal |
| 225 | 115 | Normal |
| 226 | 115 | Normal |
| 227 | 116 | Normal |
| 228 | 116 | Normal |
| 229 | 117 | Normal |
| 230 | 118 | ️ Boss |
| 231 | 119 | Post-Boss |
| 232 | 119 | Normal (Protected) |
| 233 | 119 | Normal |
| 234 | 119 | Normal |
| 235 | 120 | Normal |
| 236 | 120 | Normal |
| 237 | 121 | Normal |
| 238 | 121 | Normal |
| 239 | 122 | Normal |
| 240 | 123 | ️ Boss |
| 241 | 124 | Post-Boss |
| 242 | 124 | Normal (Protected) |
| 243 | 124 | Normal |
| 244 | 124 | Normal |
| 245 | 125 | Normal |
| 246 | 125 | Normal |
| 247 | 126 | Normal |
| 248 | 126 | Normal |
| 249 | 127 | Normal |
| 250 | 128 | ️ Boss |
| 251 | 129 | Post-Boss |
| 252 | 129 | Normal (Protected) |
| 253 | 129 | Normal |
| 254 | 129 | Normal |
| 255 | 130 | Normal |
| 256 | 130 | Normal |
| 257 | 131 | Normal |
| 258 | 131 | Normal |
| 259 | 132 | Normal |
| 260 | 133 | ️ Boss |
| 261 | 134 | Post-Boss |
| 262 | 134 | Normal (Protected) |
| 263 | 134 | Normal |
| 264 | 134 | Normal |
| 265 | 135 | Normal |
| 266 | 135 | Normal |
| 267 | 136 | Normal |
| 268 | 136 | Normal |
| 269 | 137 | Normal |
| 270 | 138 | ️ Boss |
| 271 | 139 | Post-Boss |
| 272 | 139 | Normal (Protected) |
| 273 | 139 | Normal |
| 274 | 139 | Normal |
| 275 | 140 | Normal |
| 276 | 140 | Normal |
| 277 | 141 | Normal |
| 278 | 141 | Normal |
| 279 | 142 | Normal |
| 280 | 143 | ️ Boss |
| 281 | 144 | Post-Boss |
| 282 | 144 | Normal (Protected) |
| 283 | 144 | Normal |
| 284 | 144 | Normal |
| 285 | 145 | Normal |
| 286 | 145 | Normal |
| 287 | 146 | Normal |
| 288 | 146 | Normal |
| 289 | 147 | Normal |
| 290 | 148 | ️ Boss |
| 291 | 149 | Post-Boss |
| 292 | 149 | Normal (Protected) |
| 293 | 149 | Normal |
| 294 | 149 | Normal |
| 295 | 150 | Normal |
| 296 | 150 | Normal |
| 297 | 151 | Normal |
| 298 | 151 | Normal |
| 299 | 152 | Normal |
| 300 | 153 | ️ Boss |
| 301 | 154 | Post-Boss |
| 302 | 154 | Normal (Protected) |
| 303 | 154 | Normal |
| 304 | 154 | Normal |
| 305 | 155 | Normal |
| 306 | 155 | Normal |
| 307 | 156 | Normal |
| 308 | 156 | Normal |
| 309 | 157 | Normal |
| 310 | 158 | ️ Boss |
| 311 | 159 | Post-Boss |
| 312 | 159 | Normal (Protected) |
| 313 | 159 | Normal |
| 314 | 159 | Normal |
| 315 | 160 | Normal |
| 316 | 160 | Normal |
| 317 | 161 | Normal |
| 318 | 161 | Normal |
| 319 | 162 | Normal |
| 320 | 163 | ️ Boss |
| 321 | 164 | Post-Boss |
| 322 | 164 | Normal (Protected) |
| 323 | 164 | Normal |
| 324 | 164 | Normal |
| 325 | 165 | Normal |
| 326 | 165 | Normal |
| 327 | 166 | Normal |
| 328 | 166 | Normal |
| 329 | 167 | Normal |
| 330 | 168 | ️ Boss |
| 331 | 169 | Post-Boss |
| 332 | 169 | Normal (Protected) |
| 333 | 169 | Normal |
| 334 | 169 | Normal |
| 335 | 170 | Normal |
| 336 | 170 | Normal |
| 337 | 171 | Normal |
| 338 | 171 | Normal |
| 339 | 172 | Normal |
| 340 | 173 | ️ Boss |
| 341 | 174 | Post-Boss |
| 342 | 174 | Normal (Protected) |
| 343 | 174 | Normal |
| 344 | 174 | Normal |
| 345 | 175 | Normal |
| 346 | 175 | Normal |
| 347 | 176 | Normal |
| 348 | 176 | Normal |
| 349 | 177 | Normal |
| 350 | 178 | ️ Boss |
| 351 | 179 | Post-Boss |
| 352 | 179 | Normal (Protected) |
| 353 | 179 | Normal |
| 354 | 179 | Normal |
| 355 | 180 | Normal |
| 356 | 180 | Normal |
| 357 | 181 | Normal |
| 358 | 181 | Normal |
| 359 | 182 | Normal |
| 360 | 183 | ️ Boss |
| 361 | 184 | Post-Boss |
| 362 | 184 | Normal (Protected) |
| 363 | 184 | Normal |
| 364 | 184 | Normal |
| 365 | 185 | Normal |
| 366 | 185 | Normal |
| 367 | 186 | Normal |
| 368 | 186 | Normal |
| 369 | 187 | Normal |
| 370 | 188 | ️ Boss |
| 371 | 189 | Post-Boss |
| 372 | 189 | Normal (Protected) |
| 373 | 189 | Normal |
| 374 | 189 | Normal |
| 375 | 190 | Normal |
| 376 | 190 | Normal |
| 377 | 191 | Normal |
| 378 | 191 | Normal |
| 379 | 192 | Normal |
| 380 | 193 | ️ Boss |
| 381 | 194 | Post-Boss |
| 382 | 194 | Normal (Protected) |
| 383 | 194 | Normal |
| 384 | 194 | Normal |
| 385 | 195 | Normal |
| 386 | 195 | Normal |
| 387 | 196 | Normal |
| 388 | 196 | Normal |
| 389 | 197 | Normal |
| 390 | 198 | ️ Boss |
| 391 | 199 | Post-Boss |
| 392 | 199 | Normal (Protected) |
| 393 | 199 | Normal |
| 394 | 199 | Normal |
| 395 | 200 | Normal |
| 396 | 200 | Normal |
| 397 | 201 | Normal |
| 398 | 201 | Normal |
| 399 | 202 | Normal |
| 400 | 203 | ️ Boss |
| 401 | 204 | Post-Boss |
| 402 | 204 | Normal (Protected) |
| 403 | 204 | Normal |
| 404 | 204 | Normal |
| 405 | 205 | Normal |
| 406 | 205 | Normal |
| 407 | 206 | Normal |
| 408 | 206 | Normal |
| 409 | 207 | Normal |
| 410 | 208 | ️ Boss |
| 411 | 209 | Post-Boss |
| 412 | 209 | Normal (Protected) |
| 413 | 209 | Normal |
| 414 | 209 | Normal |
| 415 | 210 | Normal |
| 416 | 210 | Normal |
| 417 | 211 | Normal |
| 418 | 211 | Normal |
| 419 | 212 | Normal |
| 420 | 213 | ️ Boss |
| 421 | 214 | Post-Boss |
| 422 | 214 | Normal (Protected) |
| 423 | 214 | Normal |
| 424 | 214 | Normal |
| 425 | 215 | Normal |
| 426 | 215 | Normal |
| 427 | 216 | Normal |
| 428 | 216 | Normal |
| 429 | 217 | Normal |
| 430 | 218 | ️ Boss |
| 431 | 219 | Post-Boss |
| 432 | 219 | Normal (Protected) |
| 433 | 219 | Normal |
| 434 | 219 | Normal |
| 435 | 220 | Normal |
| 436 | 220 | Normal |
| 437 | 221 | Normal |
| 438 | 221 | Normal |
| 439 | 222 | Normal |
| 440 | 223 | ️ Boss |
| 441 | 224 | Post-Boss |
| 442 | 224 | Normal (Protected) |
| 443 | 224 | Normal |
| 444 | 224 | Normal |
| 445 | 225 | Normal |
| 446 | 225 | Normal |
| 447 | 226 | Normal |
| 448 | 226 | Normal |
| 449 | 227 | Normal |
| 450 | 228 | ️ Boss |
| 451 | 229 | Post-Boss |
| 452 | 229 | Normal (Protected) |
| 453 | 229 | Normal |
| 454 | 229 | Normal |
| 455 | 230 | Normal |
| 456 | 230 | Normal |
| 457 | 231 | Normal |
| 458 | 231 | Normal |
| 459 | 232 | Normal |
| 460 | 233 | ️ Boss |
| 461 | 234 | Post-Boss |
| 462 | 234 | Normal (Protected) |
| 463 | 234 | Normal |
| 464 | 234 | Normal |
| 465 | 235 | Normal |
| 466 | 235 | Normal |
| 467 | 236 | Normal |
| 468 | 236 | Normal |
| 469 | 237 | Normal |
| 470 | 238 | ️ Boss |
| 471 | 239 | Post-Boss |
| 472 | 239 | Normal (Protected) |
| 473 | 239 | Normal |
| 474 | 239 | Normal |
| 475 | 240 | Normal |
| 476 | 240 | Normal |
| 477 | 241 | Normal |
| 478 | 241 | Normal |
| 479 | 242 | Normal |
| 480 | 243 | ️ Boss |
| 481 | 244 | Post-Boss |
| 482 | 244 | Normal (Protected) |
| 483 | 244 | Normal |
| 484 | 244 | Normal |
| 485 | 245 | Normal |
| 486 | 245 | Normal |
| 487 | 246 | Normal |
| 488 | 246 | Normal |
| 489 | 247 | Normal |
| 490 | 248 | ️ Boss |
| 491 | 249 | Post-Boss |
| 492 | 249 | Normal (Protected) |
| 493 | 249 | Normal |
| 494 | 249 | Normal |
| 495 | 250 | Normal |
| 496 | 250 | Normal |
| 497 | 251 | Normal |
| 498 | 251 | Normal |
| 499 | 252 | Normal |
| 500 | 253 | ️ Boss |
| 501 | 254 | Post-Boss |
| 502 | 254 | Normal (Protected) |
| 503 | 254 | Normal |
| 504 | 254 | Normal |
| 505 | 255 | Normal |
| 506 | 255 | Normal |
| 507 | 256 | Normal |
| 508 | 256 | Normal |
| 509 | 257 | Normal |
| 510 | 258 | ️ Boss |
| 511 | 259 | Post-Boss |
| 512 | 259 | Normal (Protected) |
| 513 | 259 | Normal |
| 514 | 259 | Normal |
| 515 | 260 | Normal |
| 516 | 260 | Normal |
| 517 | 261 | Normal |
| 518 | 261 | Normal |
| 519 | 262 | Normal |
| 520 | 263 | ️ Boss |
| 521 | 264 | Post-Boss |
| 522 | 264 | Normal (Protected) |
| 523 | 264 | Normal |
| 524 | 264 | Normal |
| 525 | 265 | Normal |
| 526 | 265 | Normal |
| 527 | 266 | Normal |
| 528 | 266 | Normal |
| 529 | 267 | Normal |
| 530 | 268 | ️ Boss |
| 531 | 269 | Post-Boss |
| 532 | 269 | Normal (Protected) |
| 533 | 269 | Normal |
| 534 | 269 | Normal |
| 535 | 270 | Normal |
| 536 | 270 | Normal |
| 537 | 271 | Normal |
| 538 | 271 | Normal |
| 539 | 272 | Normal |
| 540 | 273 | ️ Boss |
| 541 | 274 | Post-Boss |
| 542 | 274 | Normal (Protected) |
| 543 | 274 | Normal |
| 544 | 274 | Normal |
| 545 | 275 | Normal |
| 546 | 275 | Normal |
| 547 | 276 | Normal |
| 548 | 276 | Normal |
| 549 | 277 | Normal |
| 550 | 278 | ️ Boss |
| 551 | 279 | Post-Boss |
| 552 | 279 | Normal (Protected) |
| 553 | 279 | Normal |
| 554 | 279 | Normal |
| 555 | 280 | Normal |
| 556 | 280 | Normal |
| 557 | 281 | Normal |
| 558 | 281 | Normal |
| 559 | 282 | Normal |
| 560 | 283 | ️ Boss |
| 561 | 284 | Post-Boss |
| 562 | 284 | Normal (Protected) |
| 563 | 284 | Normal |
| 564 | 284 | Normal |
| 565 | 285 | Normal |
| 566 | 285 | Normal |
| 567 | 286 | Normal |
| 568 | 286 | Normal |
| 569 | 287 | Normal |
| 570 | 288 | ️ Boss |
| 571 | 289 | Post-Boss |
| 572 | 289 | Normal (Protected) |
| 573 | 289 | Normal |
| 574 | 289 | Normal |
| 575 | 290 | Normal |
| 576 | 290 | Normal |
| 577 | 291 | Normal |
| 578 | 291 | Normal |
| 579 | 292 | Normal |
| 580 | 293 | ️ Boss |
| 581 | 294 | Post-Boss |
| 582 | 294 | Normal (Protected) |
| 583 | 294 | Normal |
| 584 | 294 | Normal |
| 585 | 295 | Normal |
| 586 | 295 | Normal |
| 587 | 296 | Normal |
| 588 | 296 | Normal |
| 589 | 297 | Normal |
| 590 | 298 | ️ Boss |
| 591 | 299 | Post-Boss |
| 592 | 299 | Normal (Protected) |
| 593 | 299 | Normal |
| 594 | 299 | Normal |
| 595 | 300 | Normal |
| 596 | 300 | Normal |
| 597 | 301 | Normal |
| 598 | 301 | Normal |
| 599 | 302 | Normal |
| 600 | 303 | ️ Boss |
| 601 | 304 | Post-Boss |
| 602 | 304 | Normal (Protected) |
| 603 | 304 | Normal |
| 604 | 304 | Normal |
| 605 | 305 | Normal |
| 606 | 305 | Normal |
| 607 | 306 | Normal |
| 608 | 306 | Normal |
| 609 | 307 | Normal |
| 610 | 308 | ️ Boss |
| 611 | 309 | Post-Boss |
| 612 | 309 | Normal (Protected) |
| 613 | 309 | Normal |
| 614 | 309 | Normal |
| 615 | 310 | Normal |
| 616 | 310 | Normal |
| 617 | 311 | Normal |
| 618 | 311 | Normal |
| 619 | 312 | Normal |
| 620 | 313 | ️ Boss |
| 621 | 314 | Post-Boss |
| 622 | 314 | Normal (Protected) |
| 623 | 314 | Normal |
| 624 | 314 | Normal |
| 625 | 315 | Normal |
| 626 | 315 | Normal |
| 627 | 316 | Normal |
| 628 | 316 | Normal |
| 629 | 317 | Normal |
| 630 | 318 | ️ Boss |
| 631 | 319 | Post-Boss |
| 632 | 319 | Normal (Protected) |
| 633 | 319 | Normal |
| 634 | 319 | Normal |
| 635 | 320 | Normal |
| 636 | 320 | Normal |
| 637 | 321 | Normal |
| 638 | 321 | Normal |
| 639 | 322 | Normal |
| 640 | 323 | ️ Boss |
| 641 | 324 | Post-Boss |
| 642 | 324 | Normal (Protected) |
| 643 | 324 | Normal |
| 644 | 324 | Normal |
| 645 | 325 | Normal |
| 646 | 325 | Normal |
| 647 | 326 | Normal |
| 648 | 326 | Normal |
| 649 | 327 | Normal |
| 650 | 328 | ️ Boss |
| 651 | 329 | Post-Boss |
| 652 | 329 | Normal (Protected) |
| 653 | 329 | Normal |
| 654 | 329 | Normal |
| 655 | 330 | Normal |
| 656 | 330 | Normal |
| 657 | 331 | Normal |
| 658 | 331 | Normal |
| 659 | 332 | Normal |
| 660 | 333 | ️ Boss |
| 661 | 334 | Post-Boss |
| 662 | 334 | Normal (Protected) |
| 663 | 334 | Normal |
| 664 | 334 | Normal |
| 665 | 335 | Normal |
| 666 | 335 | Normal |
| 667 | 336 | Normal |
| 668 | 336 | Normal |
| 669 | 337 | Normal |
| 670 | 338 | ️ Boss |
| 671 | 339 | Post-Boss |
| 672 | 339 | Normal (Protected) |
| 673 | 339 | Normal |
| 674 | 339 | Normal |
| 675 | 340 | Normal |
| 676 | 340 | Normal |
| 677 | 341 | Normal |
| 678 | 341 | Normal |
| 679 | 342 | Normal |
| 680 | 343 | ️ Boss |
| 681 | 344 | Post-Boss |
| 682 | 344 | Normal (Protected) |
| 683 | 344 | Normal |
| 684 | 344 | Normal |
| 685 | 345 | Normal |
| 686 | 345 | Normal |
| 687 | 346 | Normal |
| 688 | 346 | Normal |
| 689 | 347 | Normal |
| 690 | 348 | ️ Boss |
| 691 | 349 | Post-Boss |
| 692 | 349 | Normal (Protected) |
| 693 | 349 | Normal |
| 694 | 349 | Normal |
| 695 | 350 | Normal |
| 696 | 350 | Normal |
| 697 | 351 | Normal |
| 698 | 351 | Normal |
| 699 | 352 | Normal |
| 700 | 353 | ️ Boss |
| 701 | 354 | Post-Boss |
| 702 | 354 | Normal (Protected) |
| 703 | 354 | Normal |
| 704 | 354 | Normal |
| 705 | 355 | Normal |
| 706 | 355 | Normal |
| 707 | 356 | Normal |
| 708 | 356 | Normal |
| 709 | 357 | Normal |
| 710 | 358 | ️ Boss |
| 711 | 359 | Post-Boss |
| 712 | 359 | Normal (Protected) |
| 713 | 359 | Normal |
| 714 | 359 | Normal |
| 715 | 360 | Normal |
| 716 | 360 | Normal |
| 717 | 361 | Normal |
| 718 | 361 | Normal |
| 719 | 362 | Normal |
| 720 | 363 | ️ Boss |
| 721 | 364 | Post-Boss |
| 722 | 364 | Normal (Protected) |
| 723 | 364 | Normal |
| 724 | 364 | Normal |
| 725 | 365 | Normal |
| 726 | 365 | Normal |
| 727 | 366 | Normal |
| 728 | 366 | Normal |
| 729 | 367 | Normal |
| 730 | 368 | ️ Boss |
| 731 | 369 | Post-Boss |
| 732 | 369 | Normal (Protected) |
| 733 | 369 | Normal |
| 734 | 369 | Normal |
| 735 | 370 | Normal |
| 736 | 370 | Normal |
| 737 | 371 | Normal |
| 738 | 371 | Normal |
| 739 | 372 | Normal |
| 740 | 373 | ️ Boss |
| 741 | 374 | Post-Boss |
| 742 | 374 | Normal (Protected) |
| 743 | 374 | Normal |
| 744 | 374 | Normal |
| 745 | 375 | Normal |
| 746 | 375 | Normal |
| 747 | 376 | Normal |
| 748 | 376 | Normal |
| 749 | 377 | Normal |
| 750 | 378 | ️ Boss |
| 751 | 379 | Post-Boss |
| 752 | 379 | Normal (Protected) |
| 753 | 379 | Normal |
| 754 | 379 | Normal |
| 755 | 380 | Normal |
| 756 | 380 | Normal |
| 757 | 381 | Normal |
| 758 | 381 | Normal |
| 759 | 382 | Normal |
| 760 | 383 | ️ Boss |
| 761 | 384 | Post-Boss |
| 762 | 384 | Normal (Protected) |
| 763 | 384 | Normal |
| 764 | 384 | Normal |
| 765 | 385 | Normal |
| 766 | 385 | Normal |
| 767 | 386 | Normal |
| 768 | 386 | Normal |
| 769 | 387 | Normal |
| 770 | 388 | ️ Boss |
| 771 | 389 | Post-Boss |
| 772 | 389 | Normal (Protected) |
| 773 | 389 | Normal |
| 774 | 389 | Normal |
| 775 | 390 | Normal |
| 776 | 390 | Normal |
| 777 | 391 | Normal |
| 778 | 391 | Normal |
| 779 | 392 | Normal |
| 780 | 393 | ️ Boss |
| 781 | 394 | Post-Boss |
| 782 | 394 | Normal (Protected) |
| 783 | 394 | Normal |
| 784 | 394 | Normal |
| 785 | 395 | Normal |
| 786 | 395 | Normal |
| 787 | 396 | Normal |
| 788 | 396 | Normal |
| 789 | 397 | Normal |
| 790 | 398 | ️ Boss |
| 791 | 399 | Post-Boss |
| 792 | 399 | Normal (Protected) |
| 793 | 399 | Normal |
| 794 | 399 | Normal |
| 795 | 400 | Normal |
| 796 | 400 | Normal |
| 797 | 401 | Normal |
| 798 | 401 | Normal |
| 799 | 402 | Normal |
| 800 | 403 | ️ Boss |
| 801 | 404 | Post-Boss |
| 802 | 404 | Normal (Protected) |
| 803 | 404 | Normal |
| 804 | 404 | Normal |
| 805 | 405 | Normal |
| 806 | 405 | Normal |
| 807 | 406 | Normal |
| 808 | 406 | Normal |
| 809 | 407 | Normal |
| 810 | 408 | ️ Boss |
| 811 | 409 | Post-Boss |
| 812 | 409 | Normal (Protected) |
| 813 | 409 | Normal |
| 814 | 409 | Normal |
| 815 | 410 | Normal |
| 816 | 410 | Normal |
| 817 | 411 | Normal |
| 818 | 411 | Normal |
| 819 | 412 | Normal |
| 820 | 413 | ️ Boss |
| 821 | 414 | Post-Boss |
| 822 | 414 | Normal (Protected) |
| 823 | 414 | Normal |
| 824 | 414 | Normal |
| 825 | 415 | Normal |
| 826 | 415 | Normal |
| 827 | 416 | Normal |
| 828 | 416 | Normal |
| 829 | 417 | Normal |
| 830 | 418 | ️ Boss |
| 831 | 419 | Post-Boss |
| 832 | 419 | Normal (Protected) |
| 833 | 419 | Normal |
| 834 | 419 | Normal |
| 835 | 420 | Normal |
| 836 | 420 | Normal |
| 837 | 421 | Normal |
| 838 | 421 | Normal |
| 839 | 422 | Normal |
| 840 | 423 | ️ Boss |
| 841 | 424 | Post-Boss |
| 842 | 424 | Normal (Protected) |
| 843 | 424 | Normal |
| 844 | 424 | Normal |
| 845 | 425 | Normal |
| 846 | 425 | Normal |
| 847 | 426 | Normal |
| 848 | 426 | Normal |
| 849 | 427 | Normal |
| 850 | 428 | ️ Boss |
| 851 | 429 | Post-Boss |
| 852 | 429 | Normal (Protected) |
| 853 | 429 | Normal |
| 854 | 429 | Normal |
| 855 | 430 | Normal |
| 856 | 430 | Normal |
| 857 | 431 | Normal |
| 858 | 431 | Normal |
| 859 | 432 | Normal |
| 860 | 433 | ️ Boss |
| 861 | 434 | Post-Boss |
| 862 | 434 | Normal (Protected) |
| 863 | 434 | Normal |
| 864 | 434 | Normal |
| 865 | 435 | Normal |
| 866 | 435 | Normal |
| 867 | 436 | Normal |
| 868 | 436 | Normal |
| 869 | 437 | Normal |
| 870 | 438 | ️ Boss |
| 871 | 439 | Post-Boss |
| 872 | 439 | Normal (Protected) |
| 873 | 439 | Normal |
| 874 | 439 | Normal |
| 875 | 440 | Normal |
| 876 | 440 | Normal |
| 877 | 441 | Normal |
| 878 | 441 | Normal |
| 879 | 442 | Normal |
| 880 | 443 | ️ Boss |
| 881 | 444 | Post-Boss |
| 882 | 444 | Normal (Protected) |
| 883 | 444 | Normal |
| 884 | 444 | Normal |
| 885 | 445 | Normal |
| 886 | 445 | Normal |
| 887 | 446 | Normal |
| 888 | 446 | Normal |
| 889 | 447 | Normal |
| 890 | 448 | ️ Boss |
| 891 | 449 | Post-Boss |
| 892 | 449 | Normal (Protected) |
| 893 | 449 | Normal |
| 894 | 449 | Normal |
| 895 | 450 | Normal |
| 896 | 450 | Normal |
| 897 | 451 | Normal |
| 898 | 451 | Normal |
| 899 | 452 | Normal |
| 900 | 453 | ️ Boss |
| 901 | 454 | Post-Boss |
| 902 | 454 | Normal (Protected) |
| 903 | 454 | Normal |
| 904 | 454 | Normal |
| 905 | 455 | Normal |
| 906 | 455 | Normal |
| 907 | 456 | Normal |
| 908 | 456 | Normal |
| 909 | 457 | Normal |
| 910 | 458 | ️ Boss |
| 911 | 459 | Post-Boss |
| 912 | 459 | Normal (Protected) |
| 913 | 459 | Normal |
| 914 | 459 | Normal |
| 915 | 460 | Normal |
| 916 | 460 | Normal |
| 917 | 461 | Normal |
| 918 | 461 | Normal |
| 919 | 462 | Normal |
| 920 | 463 | ️ Boss |
| 921 | 464 | Post-Boss |
| 922 | 464 | Normal (Protected) |
| 923 | 464 | Normal |
| 924 | 464 | Normal |
| 925 | 465 | Normal |
| 926 | 465 | Normal |
| 927 | 466 | Normal |
| 928 | 466 | Normal |
| 929 | 467 | Normal |
| 930 | 468 | ️ Boss |
| 931 | 469 | Post-Boss |
| 932 | 469 | Normal (Protected) |
| 933 | 469 | Normal |
| 934 | 469 | Normal |
| 935 | 470 | Normal |
| 936 | 470 | Normal |
| 937 | 471 | Normal |
| 938 | 471 | Normal |
| 939 | 472 | Normal |
| 940 | 473 | ️ Boss |
| 941 | 474 | Post-Boss |
| 942 | 474 | Normal (Protected) |
| 943 | 474 | Normal |
| 944 | 474 | Normal |
| 945 | 475 | Normal |
| 946 | 475 | Normal |
| 947 | 476 | Normal |
| 948 | 476 | Normal |
| 949 | 477 | Normal |
| 950 | 478 | ️ Boss |
| 951 | 479 | Post-Boss |
| 952 | 479 | Normal (Protected) |
| 953 | 479 | Normal |
| 954 | 479 | Normal |
| 955 | 480 | Normal |
| 956 | 480 | Normal |
| 957 | 481 | Normal |
| 958 | 481 | Normal |
| 959 | 482 | Normal |
| 960 | 483 | ️ Boss |
| 961 | 484 | Post-Boss |
| 962 | 484 | Normal (Protected) |
| 963 | 484 | Normal |
| 964 | 484 | Normal |
| 965 | 485 | Normal |
| 966 | 485 | Normal |
| 967 | 486 | Normal |
| 968 | 486 | Normal |
| 969 | 487 | Normal |
| 970 | 488 | ️ Boss |
| 971 | 489 | Post-Boss |
| 972 | 489 | Normal (Protected) |
| 973 | 489 | Normal |
| 974 | 489 | Normal |
| 975 | 490 | Normal |
| 976 | 490 | Normal |
| 977 | 491 | Normal |
| 978 | 491 | Normal |
| 979 | 492 | Normal |
| 980 | 493 | ️ Boss |
| 981 | 494 | Post-Boss |
| 982 | 494 | Normal (Protected) |
| 983 | 494 | Normal |
| 984 | 494 | Normal |
| 985 | 495 | Normal |
| 986 | 495 | Normal |
| 987 | 496 | Normal |
| 988 | 496 | Normal |
| 989 | 497 | Normal |
| 990 | 498 | ️ Boss |
| 991 | 499 | Post-Boss |
| 992 | 499 | Normal (Protected) |
| 993 | 499 | Normal |
| 994 | 499 | Normal |
| 995 | 500 | Normal |
| 996 | 500 | Normal |
| 997 | 501 | Normal |
| 998 | 501 | Normal |
| 999 | 502 | Normal |
| 1000 | 503 | ️ Boss |
| 1001 | 504 | Post-Boss |
| 1002 | 504 | Normal (Protected) |
| 1003 | 504 | Normal |
| 1004 | 504 | Normal |
| 1005 | 505 | Normal |
| 1006 | 505 | Normal |
| 1007 | 506 | Normal |
| 1008 | 506 | Normal |
| 1009 | 507 | Normal |
| 1010 | 508 | ️ Boss |
| 1011 | 509 | Post-Boss |
| 1012 | 509 | Normal (Protected) |
| 1013 | 509 | Normal |
| 1014 | 509 | Normal |
| 1015 | 510 | Normal |
| 1016 | 510 | Normal |
| 1017 | 511 | Normal |
| 1018 | 511 | Normal |
| 1019 | 512 | Normal |
| 1020 | 513 | ️ Boss |
| 1021 | 514 | Post-Boss |
| 1022 | 514 | Normal (Protected) |
| 1023 | 514 | Normal |
| 1024 | 514 | Normal |
| 1025 | 515 | Normal |
| 1026 | 515 | Normal |
| 1027 | 516 | Normal |
| 1028 | 516 | Normal |
| 1029 | 517 | Normal |
| 1030 | 518 | ️ Boss |
| 1031 | 519 | Post-Boss |
| 1032 | 519 | Normal (Protected) |
| 1033 | 519 | Normal |
| 1034 | 519 | Normal |
| 1035 | 520 | Normal |
| 1036 | 520 | Normal |
| 1037 | 521 | Normal |
| 1038 | 521 | Normal |
| 1039 | 522 | Normal |
| 1040 | 523 | ️ Boss |
| 1041 | 524 | Post-Boss |
| 1042 | 524 | Normal (Protected) |
| 1043 | 524 | Normal |
| 1044 | 524 | Normal |
| 1045 | 525 | Normal |
| 1046 | 525 | Normal |
| 1047 | 526 | Normal |
| 1048 | 526 | Normal |
| 1049 | 527 | Normal |
| 1050 | 528 | ️ Boss |
| 1051 | 529 | Post-Boss |
| 1052 | 529 | Normal (Protected) |
| 1053 | 529 | Normal |
| 1054 | 529 | Normal |
| 1055 | 530 | Normal |
| 1056 | 530 | Normal |
| 1057 | 531 | Normal |
| 1058 | 531 | Normal |
| 1059 | 532 | Normal |
| 1060 | 533 | ️ Boss |
| 1061 | 534 | Post-Boss |
| 1062 | 534 | Normal (Protected) |
| 1063 | 534 | Normal |
| 1064 | 534 | Normal |
| 1065 | 535 | Normal |
| 1066 | 535 | Normal |
| 1067 | 536 | Normal |
| 1068 | 536 | Normal |
| 1069 | 537 | Normal |
| 1070 | 538 | ️ Boss |
| 1071 | 539 | Post-Boss |
| 1072 | 539 | Normal (Protected) |
| 1073 | 539 | Normal |
| 1074 | 539 | Normal |
| 1075 | 540 | Normal |
| 1076 | 540 | Normal |
| 1077 | 541 | Normal |
| 1078 | 541 | Normal |
| 1079 | 542 | Normal |
| 1080 | 543 | ️ Boss |
| 1081 | 544 | Post-Boss |
| 1082 | 544 | Normal (Protected) |
| 1083 | 544 | Normal |
| 1084 | 544 | Normal |
| 1085 | 545 | Normal |
| 1086 | 545 | Normal |
| 1087 | 546 | Normal |
| 1088 | 546 | Normal |
| 1089 | 547 | Normal |
| 1090 | 548 | ️ Boss |
| 1091 | 549 | Post-Boss |
| 1092 | 549 | Normal (Protected) |
| 1093 | 549 | Normal |
| 1094 | 549 | Normal |
| 1095 | 550 | Normal |
| 1096 | 550 | Normal |
| 1097 | 551 | Normal |
| 1098 | 551 | Normal |
| 1099 | 552 | Normal |
| 1100 | 553 | ️ Boss |
| 1101 | 554 | Post-Boss |
| 1102 | 554 | Normal (Protected) |
| 1103 | 554 | Normal |
| 1104 | 554 | Normal |
| 1105 | 555 | Normal |
| 1106 | 555 | Normal |
| 1107 | 556 | Normal |
| 1108 | 556 | Normal |
| 1109 | 557 | Normal |
| 1110 | 558 | ️ Boss |
| 1111 | 559 | Post-Boss |
| 1112 | 559 | Normal (Protected) |
| 1113 | 559 | Normal |
| 1114 | 559 | Normal |
| 1115 | 560 | Normal |
| 1116 | 560 | Normal |
| 1117 | 561 | Normal |
| 1118 | 561 | Normal |
| 1119 | 562 | Normal |
| 1120 | 563 | ️ Boss |
| 1121 | 564 | Post-Boss |
| 1122 | 564 | Normal (Protected) |
| 1123 | 564 | Normal |
| 1124 | 564 | Normal |
| 1125 | 565 | Normal |
| 1126 | 565 | Normal |
| 1127 | 566 | Normal |
| 1128 | 566 | Normal |
| 1129 | 567 | Normal |
| 1130 | 568 | ️ Boss |
| 1131 | 569 | Post-Boss |
| 1132 | 569 | Normal (Protected) |
| 1133 | 569 | Normal |
| 1134 | 569 | Normal |
| 1135 | 570 | Normal |
| 1136 | 570 | Normal |
| 1137 | 571 | Normal |
| 1138 | 571 | Normal |
| 1139 | 572 | Normal |
| 1140 | 573 | ️ Boss |
| 1141 | 574 | Post-Boss |
| 1142 | 574 | Normal (Protected) |
| 1143 | 574 | Normal |
| 1144 | 574 | Normal |
| 1145 | 575 | Normal |
| 1146 | 575 | Normal |
| 1147 | 576 | Normal |
| 1148 | 576 | Normal |
| 1149 | 577 | Normal |
| 1150 | 578 | ️ Boss |
| 1151 | 579 | Post-Boss |
| 1152 | 579 | Normal (Protected) |
| 1153 | 579 | Normal |
| 1154 | 579 | Normal |
| 1155 | 580 | Normal |
| 1156 | 580 | Normal |
| 1157 | 581 | Normal |
| 1158 | 581 | Normal |
| 1159 | 582 | Normal |
| 1160 | 583 | ️ Boss |
| 1161 | 584 | Post-Boss |
| 1162 | 584 | Normal (Protected) |
| 1163 | 584 | Normal |
| 1164 | 584 | Normal |
| 1165 | 585 | Normal |
| 1166 | 585 | Normal |
| 1167 | 586 | Normal |
| 1168 | 586 | Normal |
| 1169 | 587 | Normal |
| 1170 | 588 | ️ Boss |
| 1171 | 589 | Post-Boss |
| 1172 | 589 | Normal (Protected) |
| 1173 | 589 | Normal |
| 1174 | 589 | Normal |
| 1175 | 590 | Normal |
| 1176 | 590 | Normal |
| 1177 | 591 | Normal |
| 1178 | 591 | Normal |
| 1179 | 592 | Normal |
| 1180 | 593 | ️ Boss |
| 1181 | 594 | Post-Boss |
| 1182 | 594 | Normal (Protected) |
| 1183 | 594 | Normal |
| 1184 | 594 | Normal |
| 1185 | 595 | Normal |
| 1186 | 595 | Normal |
| 1187 | 596 | Normal |
| 1188 | 596 | Normal |
| 1189 | 597 | Normal |
| 1190 | 598 | ️ Boss |
| 1191 | 599 | Post-Boss |
| 1192 | 599 | Normal (Protected) |
| 1193 | 599 | Normal |
| 1194 | 599 | Normal |
| 1195 | 600 | Normal |
| 1196 | 600 | Normal |
| 1197 | 601 | Normal |
| 1198 | 601 | Normal |
| 1199 | 602 | Normal |
| 1200 | 603 | ️ Boss |
| 1201 | 604 | Post-Boss |
| 1202 | 604 | Normal (Protected) |
| 1203 | 604 | Normal |
| 1204 | 604 | Normal |
| 1205 | 605 | Normal |
| 1206 | 605 | Normal |
| 1207 | 606 | Normal |
| 1208 | 606 | Normal |
| 1209 | 607 | Normal |
| 1210 | 608 | ️ Boss |
| 1211 | 609 | Post-Boss |
| 1212 | 609 | Normal (Protected) |
| 1213 | 609 | Normal |
| 1214 | 609 | Normal |
| 1215 | 610 | Normal |
| 1216 | 610 | Normal |
| 1217 | 611 | Normal |
| 1218 | 611 | Normal |
| 1219 | 612 | Normal |
| 1220 | 613 | ️ Boss |
| 1221 | 614 | Post-Boss |
| 1222 | 614 | Normal (Protected) |
| 1223 | 614 | Normal |
| 1224 | 614 | Normal |
| 1225 | 615 | Normal |
| 1226 | 615 | Normal |
| 1227 | 616 | Normal |
| 1228 | 616 | Normal |
| 1229 | 617 | Normal |
| 1230 | 618 | ️ Boss |
| 1231 | 619 | Post-Boss |
| 1232 | 619 | Normal (Protected) |
| 1233 | 619 | Normal |
| 1234 | 619 | Normal |
| 1235 | 620 | Normal |
| 1236 | 620 | Normal |
| 1237 | 621 | Normal |
| 1238 | 621 | Normal |
| 1239 | 622 | Normal |
| 1240 | 623 | ️ Boss |
| 1241 | 624 | Post-Boss |
| 1242 | 624 | Normal (Protected) |
| 1243 | 624 | Normal |
| 1244 | 624 | Normal |
| 1245 | 625 | Normal |
| 1246 | 625 | Normal |
| 1247 | 626 | Normal |
| 1248 | 626 | Normal |
| 1249 | 627 | Normal |
| 1250 | 628 | ️ Boss |
| 1251 | 629 | Post-Boss |
| 1252 | 629 | Normal (Protected) |
| 1253 | 629 | Normal |
| 1254 | 629 | Normal |
| 1255 | 630 | Normal |
| 1256 | 630 | Normal |
| 1257 | 631 | Normal |
| 1258 | 631 | Normal |
| 1259 | 632 | Normal |
| 1260 | 633 | ️ Boss |
| 1261 | 634 | Post-Boss |
| 1262 | 634 | Normal (Protected) |
| 1263 | 634 | Normal |
| 1264 | 634 | Normal |
| 1265 | 635 | Normal |
| 1266 | 635 | Normal |
| 1267 | 636 | Normal |
| 1268 | 636 | Normal |
| 1269 | 637 | Normal |
| 1270 | 638 | ️ Boss |
| 1271 | 639 | Post-Boss |
| 1272 | 639 | Normal (Protected) |
| 1273 | 639 | Normal |
| 1274 | 639 | Normal |
| 1275 | 640 | Normal |
| 1276 | 640 | Normal |
| 1277 | 641 | Normal |
| 1278 | 641 | Normal |
| 1279 | 642 | Normal |
| 1280 | 643 | ️ Boss |
| 1281 | 644 | Post-Boss |
| 1282 | 644 | Normal (Protected) |
| 1283 | 644 | Normal |
| 1284 | 644 | Normal |
| 1285 | 645 | Normal |
| 1286 | 645 | Normal |
| 1287 | 646 | Normal |
| 1288 | 646 | Normal |
| 1289 | 647 | Normal |
| 1290 | 648 | ️ Boss |
| 1291 | 649 | Post-Boss |
| 1292 | 649 | Normal (Protected) |
| 1293 | 649 | Normal |
| 1294 | 649 | Normal |
| 1295 | 650 | Normal |
| 1296 | 650 | Normal |
| 1297 | 651 | Normal |
| 1298 | 651 | Normal |
| 1299 | 652 | Normal |
| 1300 | 653 | ️ Boss |
| 1301 | 654 | Post-Boss |
| 1302 | 654 | Normal (Protected) |
| 1303 | 654 | Normal |
| 1304 | 654 | Normal |
| 1305 | 655 | Normal |
| 1306 | 655 | Normal |
| 1307 | 656 | Normal |
| 1308 | 656 | Normal |
| 1309 | 657 | Normal |
| 1310 | 658 | ️ Boss |
| 1311 | 659 | Post-Boss |
| 1312 | 659 | Normal (Protected) |
| 1313 | 659 | Normal |
| 1314 | 659 | Normal |
| 1315 | 660 | Normal |
| 1316 | 660 | Normal |
| 1317 | 661 | Normal |
| 1318 | 661 | Normal |
| 1319 | 662 | Normal |
| 1320 | 663 | ️ Boss |
| 1321 | 664 | Post-Boss |
| 1322 | 664 | Normal (Protected) |
| 1323 | 664 | Normal |
| 1324 | 664 | Normal |
| 1325 | 665 | Normal |
| 1326 | 665 | Normal |
| 1327 | 666 | Normal |
| 1328 | 666 | Normal |
| 1329 | 667 | Normal |
| 1330 | 668 | ️ Boss |
| 1331 | 669 | Post-Boss |
| 1332 | 669 | Normal (Protected) |
| 1333 | 669 | Normal |
| 1334 | 669 | Normal |
| 1335 | 670 | Normal |
| 1336 | 670 | Normal |
| 1337 | 671 | Normal |
| 1338 | 671 | Normal |
| 1339 | 672 | Normal |
| 1340 | 673 | ️ Boss |
| 1341 | 674 | Post-Boss |
| 1342 | 674 | Normal (Protected) |
| 1343 | 674 | Normal |
| 1344 | 674 | Normal |
| 1345 | 675 | Normal |
| 1346 | 675 | Normal |
| 1347 | 676 | Normal |
| 1348 | 676 | Normal |
| 1349 | 677 | Normal |
| 1350 | 678 | ️ Boss |
| 1351 | 679 | Post-Boss |
| 1352 | 679 | Normal (Protected) |
| 1353 | 679 | Normal |
| 1354 | 679 | Normal |
| 1355 | 680 | Normal |
| 1356 | 680 | Normal |
| 1357 | 681 | Normal |
| 1358 | 681 | Normal |
| 1359 | 682 | Normal |
| 1360 | 683 | ️ Boss |
| 1361 | 684 | Post-Boss |
| 1362 | 684 | Normal (Protected) |
| 1363 | 684 | Normal |
| 1364 | 684 | Normal |
| 1365 | 685 | Normal |
| 1366 | 685 | Normal |
| 1367 | 686 | Normal |
| 1368 | 686 | Normal |
| 1369 | 687 | Normal |
| 1370 | 688 | ️ Boss |
| 1371 | 689 | Post-Boss |
| 1372 | 689 | Normal (Protected) |
| 1373 | 689 | Normal |
| 1374 | 689 | Normal |
| 1375 | 690 | Normal |
| 1376 | 690 | Normal |
| 1377 | 691 | Normal |
| 1378 | 691 | Normal |
| 1379 | 692 | Normal |
| 1380 | 693 | ️ Boss |
| 1381 | 694 | Post-Boss |
| 1382 | 694 | Normal (Protected) |
| 1383 | 694 | Normal |
| 1384 | 694 | Normal |
| 1385 | 695 | Normal |
| 1386 | 695 | Normal |
| 1387 | 696 | Normal |
| 1388 | 696 | Normal |
| 1389 | 697 | Normal |
| 1390 | 698 | ️ Boss |
| 1391 | 699 | Post-Boss |
| 1392 | 699 | Normal (Protected) |
| 1393 | 699 | Normal |
| 1394 | 699 | Normal |
| 1395 | 700 | Normal |
| 1396 | 700 | Normal |
| 1397 | 701 | Normal |
| 1398 | 701 | Normal |
| 1399 | 702 | Normal |
| 1400 | 703 | ️ Boss |
| 1401 | 704 | Post-Boss |
| 1402 | 704 | Normal (Protected) |
| 1403 | 704 | Normal |
| 1404 | 704 | Normal |
| 1405 | 705 | Normal |
| 1406 | 705 | Normal |
| 1407 | 706 | Normal |
| 1408 | 706 | Normal |
| 1409 | 707 | Normal |
| 1410 | 708 | ️ Boss |
| 1411 | 709 | Post-Boss |
| 1412 | 709 | Normal (Protected) |
| 1413 | 709 | Normal |
| 1414 | 709 | Normal |
| 1415 | 710 | Normal |
| 1416 | 710 | Normal |
| 1417 | 711 | Normal |
| 1418 | 711 | Normal |
| 1419 | 712 | Normal |
| 1420 | 713 | ️ Boss |
| 1421 | 714 | Post-Boss |
| 1422 | 714 | Normal (Protected) |
| 1423 | 714 | Normal |
| 1424 | 714 | Normal |
| 1425 | 715 | Normal |
| 1426 | 715 | Normal |
| 1427 | 716 | Normal |
| 1428 | 716 | Normal |
| 1429 | 717 | Normal |
| 1430 | 718 | ️ Boss |
| 1431 | 719 | Post-Boss |
| 1432 | 719 | Normal (Protected) |
| 1433 | 719 | Normal |
| 1434 | 719 | Normal |
| 1435 | 720 | Normal |
| 1436 | 720 | Normal |
| 1437 | 721 | Normal |
| 1438 | 721 | Normal |
| 1439 | 722 | Normal |
| 1440 | 723 | ️ Boss |
| 1441 | 724 | Post-Boss |
| 1442 | 724 | Normal (Protected) |
| 1443 | 724 | Normal |
| 1444 | 724 | Normal |
| 1445 | 725 | Normal |
| 1446 | 725 | Normal |
| 1447 | 726 | Normal |
| 1448 | 726 | Normal |
| 1449 | 727 | Normal |
| 1450 | 728 | ️ Boss |
| 1451 | 729 | Post-Boss |
| 1452 | 729 | Normal (Protected) |
| 1453 | 729 | Normal |
| 1454 | 729 | Normal |
| 1455 | 730 | Normal |
| 1456 | 730 | Normal |
| 1457 | 731 | Normal |
| 1458 | 731 | Normal |
| 1459 | 732 | Normal |
| 1460 | 733 | ️ Boss |
| 1461 | 734 | Post-Boss |
| 1462 | 734 | Normal (Protected) |
| 1463 | 734 | Normal |
| 1464 | 734 | Normal |
| 1465 | 735 | Normal |
| 1466 | 735 | Normal |
| 1467 | 736 | Normal |
| 1468 | 736 | Normal |
| 1469 | 737 | Normal |
| 1470 | 738 | ️ Boss |
| 1471 | 739 | Post-Boss |
| 1472 | 739 | Normal (Protected) |
| 1473 | 739 | Normal |
| 1474 | 739 | Normal |
| 1475 | 740 | Normal |
| 1476 | 740 | Normal |
| 1477 | 741 | Normal |
| 1478 | 741 | Normal |
| 1479 | 742 | Normal |
| 1480 | 743 | ️ Boss |
| 1481 | 744 | Post-Boss |
| 1482 | 744 | Normal (Protected) |
| 1483 | 744 | Normal |
| 1484 | 744 | Normal |
| 1485 | 745 | Normal |
| 1486 | 745 | Normal |
| 1487 | 746 | Normal |
| 1488 | 746 | Normal |
| 1489 | 747 | Normal |
| 1490 | 748 | ️ Boss |
| 1491 | 749 | Post-Boss |
| 1492 | 749 | Normal (Protected) |
| 1493 | 749 | Normal |
| 1494 | 749 | Normal |
| 1495 | 750 | Normal |
| 1496 | 750 | Normal |
| 1497 | 751 | Normal |
| 1498 | 751 | Normal |
| 1499 | 752 | Normal |
| 1500 | 753 | ️ Boss |
| 1501 | 754 | Post-Boss |
| 1502 | 754 | Normal (Protected) |
| 1503 | 754 | Normal |
| 1504 | 754 | Normal |
| 1505 | 755 | Normal |
| 1506 | 755 | Normal |
| 1507 | 756 | Normal |
| 1508 | 756 | Normal |
| 1509 | 757 | Normal |
| 1510 | 758 | ️ Boss |
| 1511 | 759 | Post-Boss |
| 1512 | 759 | Normal (Protected) |
| 1513 | 759 | Normal |
| 1514 | 759 | Normal |
| 1515 | 760 | Normal |
| 1516 | 760 | Normal |
| 1517 | 761 | Normal |
| 1518 | 761 | Normal |
| 1519 | 762 | Normal |
| 1520 | 763 | ️ Boss |
| 1521 | 764 | Post-Boss |
| 1522 | 764 | Normal (Protected) |
| 1523 | 764 | Normal |
| 1524 | 764 | Normal |
| 1525 | 765 | Normal |
| 1526 | 765 | Normal |
| 1527 | 766 | Normal |
| 1528 | 766 | Normal |
| 1529 | 767 | Normal |
| 1530 | 768 | ️ Boss |
| 1531 | 769 | Post-Boss |
| 1532 | 769 | Normal (Protected) |
| 1533 | 769 | Normal |
| 1534 | 769 | Normal |
| 1535 | 770 | Normal |
| 1536 | 770 | Normal |
| 1537 | 771 | Normal |
| 1538 | 771 | Normal |
| 1539 | 772 | Normal |
| 1540 | 773 | ️ Boss |
| 1541 | 774 | Post-Boss |
| 1542 | 774 | Normal (Protected) |
| 1543 | 774 | Normal |
| 1544 | 774 | Normal |
| 1545 | 775 | Normal |
| 1546 | 775 | Normal |
| 1547 | 776 | Normal |
| 1548 | 776 | Normal |
| 1549 | 777 | Normal |
| 1550 | 778 | ️ Boss |
| 1551 | 779 | Post-Boss |
| 1552 | 779 | Normal (Protected) |
| 1553 | 779 | Normal |
| 1554 | 779 | Normal |
| 1555 | 780 | Normal |
| 1556 | 780 | Normal |
| 1557 | 781 | Normal |
| 1558 | 781 | Normal |
| 1559 | 782 | Normal |
| 1560 | 783 | ️ Boss |
| 1561 | 784 | Post-Boss |
| 1562 | 784 | Normal (Protected) |
| 1563 | 784 | Normal |
| 1564 | 784 | Normal |
| 1565 | 785 | Normal |
| 1566 | 785 | Normal |
| 1567 | 786 | Normal |
| 1568 | 786 | Normal |
| 1569 | 787 | Normal |
| 1570 | 788 | ️ Boss |
| 1571 | 789 | Post-Boss |
| 1572 | 789 | Normal (Protected) |
| 1573 | 789 | Normal |
| 1574 | 789 | Normal |
| 1575 | 790 | Normal |
| 1576 | 790 | Normal |
| 1577 | 791 | Normal |
| 1578 | 791 | Normal |
| 1579 | 792 | Normal |
| 1580 | 793 | ️ Boss |
| 1581 | 794 | Post-Boss |
| 1582 | 794 | Normal (Protected) |
| 1583 | 794 | Normal |
| 1584 | 794 | Normal |
| 1585 | 795 | Normal |
| 1586 | 795 | Normal |
| 1587 | 796 | Normal |
| 1588 | 796 | Normal |
| 1589 | 797 | Normal |
| 1590 | 798 | ️ Boss |
| 1591 | 799 | Post-Boss |
| 1592 | 799 | Normal (Protected) |
| 1593 | 799 | Normal |
| 1594 | 799 | Normal |
| 1595 | 800 | Normal |
| 1596 | 800 | Normal |
| 1597 | 801 | Normal |
| 1598 | 801 | Normal |
| 1599 | 802 | Normal |
| 1600 | 803 | ️ Boss |
| 1601 | 804 | Post-Boss |
| 1602 | 804 | Normal (Protected) |
| 1603 | 804 | Normal |
| 1604 | 804 | Normal |
| 1605 | 805 | Normal |
| 1606 | 805 | Normal |
| 1607 | 806 | Normal |
| 1608 | 806 | Normal |
| 1609 | 807 | Normal |
| 1610 | 808 | ️ Boss |
| 1611 | 809 | Post-Boss |
| 1612 | 809 | Normal (Protected) |
| 1613 | 809 | Normal |
| 1614 | 809 | Normal |
| 1615 | 810 | Normal |
| 1616 | 810 | Normal |
| 1617 | 811 | Normal |
| 1618 | 811 | Normal |
| 1619 | 812 | Normal |
| 1620 | 813 | ️ Boss |
| 1621 | 814 | Post-Boss |
| 1622 | 814 | Normal (Protected) |
| 1623 | 814 | Normal |
| 1624 | 814 | Normal |
| 1625 | 815 | Normal |
| 1626 | 815 | Normal |
| 1627 | 816 | Normal |
| 1628 | 816 | Normal |
| 1629 | 817 | Normal |
| 1630 | 818 | ️ Boss |
| 1631 | 819 | Post-Boss |
| 1632 | 819 | Normal (Protected) |
| 1633 | 819 | Normal |
| 1634 | 819 | Normal |
| 1635 | 820 | Normal |
| 1636 | 820 | Normal |
| 1637 | 821 | Normal |
| 1638 | 821 | Normal |
| 1639 | 822 | Normal |
| 1640 | 823 | ️ Boss |
| 1641 | 824 | Post-Boss |
| 1642 | 824 | Normal (Protected) |
| 1643 | 824 | Normal |
| 1644 | 824 | Normal |
| 1645 | 825 | Normal |
| 1646 | 825 | Normal |
| 1647 | 826 | Normal |
| 1648 | 826 | Normal |
| 1649 | 827 | Normal |
| 1650 | 828 | ️ Boss |
| 1651 | 829 | Post-Boss |
| 1652 | 829 | Normal (Protected) |
| 1653 | 829 | Normal |
| 1654 | 829 | Normal |
| 1655 | 830 | Normal |
| 1656 | 830 | Normal |
| 1657 | 831 | Normal |
| 1658 | 831 | Normal |
| 1659 | 832 | Normal |
| 1660 | 833 | ️ Boss |
| 1661 | 834 | Post-Boss |
| 1662 | 834 | Normal (Protected) |
| 1663 | 834 | Normal |
| 1664 | 834 | Normal |
| 1665 | 835 | Normal |
| 1666 | 835 | Normal |
| 1667 | 836 | Normal |
| 1668 | 836 | Normal |
| 1669 | 837 | Normal |
| 1670 | 838 | ️ Boss |
| 1671 | 839 | Post-Boss |
| 1672 | 839 | Normal (Protected) |
| 1673 | 839 | Normal |
| 1674 | 839 | Normal |
| 1675 | 840 | Normal |
| 1676 | 840 | Normal |
| 1677 | 841 | Normal |
| 1678 | 841 | Normal |
| 1679 | 842 | Normal |
| 1680 | 843 | ️ Boss |
| 1681 | 844 | Post-Boss |
| 1682 | 844 | Normal (Protected) |
| 1683 | 844 | Normal |
| 1684 | 844 | Normal |
| 1685 | 845 | Normal |
| 1686 | 845 | Normal |
| 1687 | 846 | Normal |
| 1688 | 846 | Normal |
| 1689 | 847 | Normal |
| 1690 | 848 | ️ Boss |
| 1691 | 849 | Post-Boss |
| 1692 | 849 | Normal (Protected) |
| 1693 | 849 | Normal |
| 1694 | 849 | Normal |
| 1695 | 850 | Normal |
| 1696 | 850 | Normal |
| 1697 | 851 | Normal |
| 1698 | 851 | Normal |
| 1699 | 852 | Normal |
| 1700 | 853 | ️ Boss |
| 1701 | 854 | Post-Boss |
| 1702 | 854 | Normal (Protected) |
| 1703 | 854 | Normal |
| 1704 | 854 | Normal |
| 1705 | 855 | Normal |
| 1706 | 855 | Normal |
| 1707 | 856 | Normal |
| 1708 | 856 | Normal |
| 1709 | 857 | Normal |
| 1710 | 858 | ️ Boss |
| 1711 | 859 | Post-Boss |
| 1712 | 859 | Normal (Protected) |
| 1713 | 859 | Normal |
| 1714 | 859 | Normal |
| 1715 | 860 | Normal |
| 1716 | 860 | Normal |
| 1717 | 861 | Normal |
| 1718 | 861 | Normal |
| 1719 | 862 | Normal |
| 1720 | 863 | ️ Boss |
| 1721 | 864 | Post-Boss |
| 1722 | 864 | Normal (Protected) |
| 1723 | 864 | Normal |
| 1724 | 864 | Normal |
| 1725 | 865 | Normal |
| 1726 | 865 | Normal |
| 1727 | 866 | Normal |
| 1728 | 866 | Normal |
| 1729 | 867 | Normal |
| 1730 | 868 | ️ Boss |
| 1731 | 869 | Post-Boss |
| 1732 | 869 | Normal (Protected) |
| 1733 | 869 | Normal |
| 1734 | 869 | Normal |
| 1735 | 870 | Normal |
| 1736 | 870 | Normal |
| 1737 | 871 | Normal |
| 1738 | 871 | Normal |
| 1739 | 872 | Normal |
| 1740 | 873 | ️ Boss |
| 1741 | 874 | Post-Boss |
| 1742 | 874 | Normal (Protected) |
| 1743 | 874 | Normal |
| 1744 | 874 | Normal |
| 1745 | 875 | Normal |
| 1746 | 875 | Normal |
| 1747 | 876 | Normal |
| 1748 | 876 | Normal |
| 1749 | 877 | Normal |
| 1750 | 878 | ️ Boss |
| 1751 | 879 | Post-Boss |
| 1752 | 879 | Normal (Protected) |
| 1753 | 879 | Normal |
| 1754 | 879 | Normal |
| 1755 | 880 | Normal |
| 1756 | 880 | Normal |
| 1757 | 881 | Normal |
| 1758 | 881 | Normal |
| 1759 | 882 | Normal |
| 1760 | 883 | ️ Boss |
| 1761 | 884 | Post-Boss |
| 1762 | 884 | Normal (Protected) |
| 1763 | 884 | Normal |
| 1764 | 884 | Normal |
| 1765 | 885 | Normal |
| 1766 | 885 | Normal |
| 1767 | 886 | Normal |
| 1768 | 886 | Normal |
| 1769 | 887 | Normal |
| 1770 | 888 | ️ Boss |
| 1771 | 889 | Post-Boss |
| 1772 | 889 | Normal (Protected) |
| 1773 | 889 | Normal |
| 1774 | 889 | Normal |
| 1775 | 890 | Normal |
| 1776 | 890 | Normal |
| 1777 | 891 | Normal |
| 1778 | 891 | Normal |
| 1779 | 892 | Normal |
| 1780 | 893 | ️ Boss |
| 1781 | 894 | Post-Boss |
| 1782 | 894 | Normal (Protected) |
| 1783 | 894 | Normal |
| 1784 | 894 | Normal |
| 1785 | 895 | Normal |
| 1786 | 895 | Normal |
| 1787 | 896 | Normal |
| 1788 | 896 | Normal |
| 1789 | 897 | Normal |
| 1790 | 898 | ️ Boss |
| 1791 | 899 | Post-Boss |
| 1792 | 899 | Normal (Protected) |
| 1793 | 899 | Normal |
| 1794 | 899 | Normal |
| 1795 | 900 | Normal |
| 1796 | 900 | Normal |
| 1797 | 901 | Normal |
| 1798 | 901 | Normal |
| 1799 | 902 | Normal |
| 1800 | 903 | ️ Boss |
| 1801 | 904 | Post-Boss |
| 1802 | 904 | Normal (Protected) |
| 1803 | 904 | Normal |
| 1804 | 904 | Normal |
| 1805 | 905 | Normal |
| 1806 | 905 | Normal |
| 1807 | 906 | Normal |
| 1808 | 906 | Normal |
| 1809 | 907 | Normal |
| 1810 | 908 | ️ Boss |
| 1811 | 909 | Post-Boss |
| 1812 | 909 | Normal (Protected) |
| 1813 | 909 | Normal |
| 1814 | 909 | Normal |
| 1815 | 910 | Normal |
| 1816 | 910 | Normal |
| 1817 | 911 | Normal |
| 1818 | 911 | Normal |
| 1819 | 912 | Normal |
| 1820 | 913 | ️ Boss |
| 1821 | 914 | Post-Boss |
| 1822 | 914 | Normal (Protected) |
| 1823 | 914 | Normal |
| 1824 | 914 | Normal |
| 1825 | 915 | Normal |
| 1826 | 915 | Normal |
| 1827 | 916 | Normal |
| 1828 | 916 | Normal |
| 1829 | 917 | Normal |
| 1830 | 918 | ️ Boss |
| 1831 | 919 | Post-Boss |
| 1832 | 919 | Normal (Protected) |
| 1833 | 919 | Normal |
| 1834 | 919 | Normal |
| 1835 | 920 | Normal |
| 1836 | 920 | Normal |
| 1837 | 921 | Normal |
| 1838 | 921 | Normal |
| 1839 | 922 | Normal |
| 1840 | 923 | ️ Boss |
| 1841 | 924 | Post-Boss |
| 1842 | 924 | Normal (Protected) |
| 1843 | 924 | Normal |
| 1844 | 924 | Normal |
| 1845 | 925 | Normal |
| 1846 | 925 | Normal |
| 1847 | 926 | Normal |
| 1848 | 926 | Normal |
| 1849 | 927 | Normal |
| 1850 | 928 | ️ Boss |
| 1851 | 929 | Post-Boss |
| 1852 | 929 | Normal (Protected) |
| 1853 | 929 | Normal |
| 1854 | 929 | Normal |
| 1855 | 930 | Normal |
| 1856 | 930 | Normal |
| 1857 | 931 | Normal |
| 1858 | 931 | Normal |
| 1859 | 932 | Normal |
| 1860 | 933 | ️ Boss |
| 1861 | 934 | Post-Boss |
| 1862 | 934 | Normal (Protected) |
| 1863 | 934 | Normal |
| 1864 | 934 | Normal |
| 1865 | 935 | Normal |
| 1866 | 935 | Normal |
| 1867 | 936 | Normal |
| 1868 | 936 | Normal |
| 1869 | 937 | Normal |
| 1870 | 938 | ️ Boss |
| 1871 | 939 | Post-Boss |
| 1872 | 939 | Normal (Protected) |
| 1873 | 939 | Normal |
| 1874 | 939 | Normal |
| 1875 | 940 | Normal |
| 1876 | 940 | Normal |
| 1877 | 941 | Normal |
| 1878 | 941 | Normal |
| 1879 | 942 | Normal |
| 1880 | 943 | ️ Boss |
| 1881 | 944 | Post-Boss |
| 1882 | 944 | Normal (Protected) |
| 1883 | 944 | Normal |
| 1884 | 944 | Normal |
| 1885 | 945 | Normal |
| 1886 | 945 | Normal |
| 1887 | 946 | Normal |
| 1888 | 946 | Normal |
| 1889 | 947 | Normal |
| 1890 | 948 | ️ Boss |
| 1891 | 949 | Post-Boss |
| 1892 | 949 | Normal (Protected) |
| 1893 | 949 | Normal |
| 1894 | 949 | Normal |
| 1895 | 950 | Normal |
| 1896 | 950 | Normal |
| 1897 | 951 | Normal |
| 1898 | 951 | Normal |
| 1899 | 952 | Normal |
| 1900 | 953 | ️ Boss |
| 1901 | 954 | Post-Boss |
| 1902 | 954 | Normal (Protected) |
| 1903 | 954 | Normal |
| 1904 | 954 | Normal |
| 1905 | 955 | Normal |
| 1906 | 955 | Normal |
| 1907 | 956 | Normal |
| 1908 | 956 | Normal |
| 1909 | 957 | Normal |
| 1910 | 958 | ️ Boss |
| 1911 | 959 | Post-Boss |
| 1912 | 959 | Normal (Protected) |
| 1913 | 959 | Normal |
| 1914 | 959 | Normal |
| 1915 | 960 | Normal |
| 1916 | 960 | Normal |
| 1917 | 961 | Normal |
| 1918 | 961 | Normal |
| 1919 | 962 | Normal |
| 1920 | 963 | ️ Boss |
| 1921 | 964 | Post-Boss |
| 1922 | 964 | Normal (Protected) |
| 1923 | 964 | Normal |
| 1924 | 964 | Normal |
| 1925 | 965 | Normal |
| 1926 | 965 | Normal |
| 1927 | 966 | Normal |
| 1928 | 966 | Normal |
| 1929 | 967 | Normal |
| 1930 | 968 | ️ Boss |
| 1931 | 969 | Post-Boss |
| 1932 | 969 | Normal (Protected) |
| 1933 | 969 | Normal |
| 1934 | 969 | Normal |
| 1935 | 970 | Normal |
| 1936 | 970 | Normal |
| 1937 | 971 | Normal |
| 1938 | 971 | Normal |
| 1939 | 972 | Normal |
| 1940 | 973 | ️ Boss |
| 1941 | 974 | Post-Boss |
| 1942 | 974 | Normal (Protected) |
| 1943 | 974 | Normal |
| 1944 | 974 | Normal |
| 1945 | 975 | Normal |
| 1946 | 975 | Normal |
| 1947 | 976 | Normal |
| 1948 | 976 | Normal |
| 1949 | 977 | Normal |
| 1950 | 978 | ️ Boss |
| 1951 | 979 | Post-Boss |
| 1952 | 979 | Normal (Protected) |
| 1953 | 979 | Normal |
| 1954 | 979 | Normal |
| 1955 | 980 | Normal |
| 1956 | 980 | Normal |
| 1957 | 981 | Normal |
| 1958 | 981 | Normal |
| 1959 | 982 | Normal |
| 1960 | 983 | ️ Boss |
| 1961 | 984 | Post-Boss |
| 1962 | 984 | Normal (Protected) |
| 1963 | 984 | Normal |
| 1964 | 984 | Normal |
| 1965 | 985 | Normal |
| 1966 | 985 | Normal |
| 1967 | 986 | Normal |
| 1968 | 986 | Normal |
| 1969 | 987 | Normal |
| 1970 | 988 | ️ Boss |
| 1971 | 989 | Post-Boss |
| 1972 | 989 | Normal (Protected) |
| 1973 | 989 | Normal |
| 1974 | 989 | Normal |
| 1975 | 990 | Normal |
| 1976 | 990 | Normal |
| 1977 | 991 | Normal |
| 1978 | 991 | Normal |
| 1979 | 992 | Normal |
| 1980 | 993 | ️ Boss |
| 1981 | 994 | Post-Boss |
| 1982 | 994 | Normal (Protected) |
| 1983 | 994 | Normal |
| 1984 | 994 | Normal |
| 1985 | 995 | Normal |
| 1986 | 995 | Normal |
| 1987 | 996 | Normal |
| 1988 | 996 | Normal |
| 1989 | 997 | Normal |
| 1990 | 998 | ️ Boss |
| 1991 | 999 | Post-Boss |
| 1992 | 999 | Normal (Protected) |
| 1993 | 999 | Normal |
| 1994 | 999 | Normal |
| 1995 | 1000 | Normal |
| 1996 | 1000 | Normal |
| 1997 | 1001 | Normal |
| 1998 | 1001 | Normal |
| 1999 | 1002 | Normal |
| 2000 | 1003 | ️ Boss |
| 2001 | 1004 | Post-Boss |
| 2002 | 1004 | Normal (Protected) |
| 2003 | 1004 | Normal |
| 2004 | 1004 | Normal |
| 2005 | 1005 | Normal |
| 2006 | 1005 | Normal |
| 2007 | 1006 | Normal |
| 2008 | 1006 | Normal |
| 2009 | 1007 | Normal |
| 2010 | 1008 | ️ Boss |
| 2011 | 1009 | Post-Boss |
| 2012 | 1009 | Normal (Protected) |
| 2013 | 1009 | Normal |
| 2014 | 1009 | Normal |
| 2015 | 1010 | Normal |
| 2016 | 1010 | Normal |
| 2017 | 1011 | Normal |
| 2018 | 1011 | Normal |
| 2019 | 1012 | Normal |
| 2020 | 1013 | ️ Boss |
| 2021 | 1014 | Post-Boss |
| 2022 | 1014 | Normal (Protected) |
| 2023 | 1014 | Normal |
| 2024 | 1014 | Normal |
| 2025 | 1015 | Normal |
| 2026 | 1015 | Normal |
| 2027 | 1016 | Normal |
| 2028 | 1016 | Normal |
| 2029 | 1017 | Normal |
| 2030 | 1018 | ️ Boss |
| 2031 | 1019 | Post-Boss |
| 2032 | 1019 | Normal (Protected) |
| 2033 | 1019 | Normal |
| 2034 | 1019 | Normal |
| 2035 | 1020 | Normal |
| 2036 | 1020 | Normal |
| 2037 | 1021 | Normal |
| 2038 | 1021 | Normal |
| 2039 | 1022 | Normal |
| 2040 | 1023 | ️ Boss |
| 2041 | 1024 | Post-Boss |
| 2042 | 1024 | Normal (Protected) |
| 2043 | 1024 | Normal |
| 2044 | 1024 | Normal |
| 2045 | 1025 | Normal |
| 2046 | 1025 | Normal |
| 2047 | 1026 | Normal |
| 2048 | 1026 | Normal |
| 2049 | 1027 | Normal |
| 2050 | 1028 | ️ Boss |
| 2051 | 1029 | Post-Boss |
| 2052 | 1029 | Normal (Protected) |
| 2053 | 1029 | Normal |
| 2054 | 1029 | Normal |
| 2055 | 1030 | Normal |
| 2056 | 1030 | Normal |
| 2057 | 1031 | Normal |
| 2058 | 1031 | Normal |
| 2059 | 1032 | Normal |
| 2060 | 1033 | ️ Boss |
| 2061 | 1034 | Post-Boss |
| 2062 | 1034 | Normal (Protected) |
| 2063 | 1034 | Normal |
| 2064 | 1034 | Normal |
| 2065 | 1035 | Normal |
| 2066 | 1035 | Normal |
| 2067 | 1036 | Normal |
| 2068 | 1036 | Normal |
| 2069 | 1037 | Normal |
| 2070 | 1038 | ️ Boss |
| 2071 | 1039 | Post-Boss |
| 2072 | 1039 | Normal (Protected) |
| 2073 | 1039 | Normal |
| 2074 | 1039 | Normal |
| 2075 | 1040 | Normal |
| 2076 | 1040 | Normal |
| 2077 | 1041 | Normal |
| 2078 | 1041 | Normal |
| 2079 | 1042 | Normal |
| 2080 | 1043 | ️ Boss |
| 2081 | 1044 | Post-Boss |
| 2082 | 1044 | Normal (Protected) |
| 2083 | 1044 | Normal |
| 2084 | 1044 | Normal |
| 2085 | 1045 | Normal |
| 2086 | 1045 | Normal |
| 2087 | 1046 | Normal |
| 2088 | 1046 | Normal |
| 2089 | 1047 | Normal |
| 2090 | 1048 | ️ Boss |
| 2091 | 1049 | Post-Boss |
| 2092 | 1049 | Normal (Protected) |
| 2093 | 1049 | Normal |
| 2094 | 1049 | Normal |
| 2095 | 1050 | Normal |
| 2096 | 1050 | Normal |
| 2097 | 1051 | Normal |
| 2098 | 1051 | Normal |
| 2099 | 1052 | Normal |
| 2100 | 1053 | ️ Boss |
| 2101 | 1054 | Post-Boss |
| 2102 | 1054 | Normal (Protected) |
| 2103 | 1054 | Normal |
| 2104 | 1054 | Normal |
| 2105 | 1055 | Normal |
| 2106 | 1055 | Normal |
| 2107 | 1056 | Normal |
| 2108 | 1056 | Normal |
| 2109 | 1057 | Normal |
| 2110 | 1058 | ️ Boss |
| 2111 | 1059 | Post-Boss |
| 2112 | 1059 | Normal (Protected) |
| 2113 | 1059 | Normal |
| 2114 | 1059 | Normal |
| 2115 | 1060 | Normal |
| 2116 | 1060 | Normal |
| 2117 | 1061 | Normal |
| 2118 | 1061 | Normal |
| 2119 | 1062 | Normal |
| 2120 | 1063 | ️ Boss |
| 2121 | 1064 | Post-Boss |
| 2122 | 1064 | Normal (Protected) |
| 2123 | 1064 | Normal |
| 2124 | 1064 | Normal |
| 2125 | 1065 | Normal |
| 2126 | 1065 | Normal |
| 2127 | 1066 | Normal |
| 2128 | 1066 | Normal |
| 2129 | 1067 | Normal |
| 2130 | 1068 | ️ Boss |
| 2131 | 1069 | Post-Boss |
| 2132 | 1069 | Normal (Protected) |
| 2133 | 1069 | Normal |
| 2134 | 1069 | Normal |
| 2135 | 1070 | Normal |
| 2136 | 1070 | Normal |
| 2137 | 1071 | Normal |
| 2138 | 1071 | Normal |
| 2139 | 1072 | Normal |
| 2140 | 1073 | ️ Boss |
| 2141 | 1074 | Post-Boss |
| 2142 | 1074 | Normal (Protected) |
| 2143 | 1074 | Normal |
| 2144 | 1074 | Normal |
| 2145 | 1075 | Normal |
| 2146 | 1075 | Normal |
| 2147 | 1076 | Normal |
| 2148 | 1076 | Normal |
| 2149 | 1077 | Normal |
| 2150 | 1078 | ️ Boss |
| 2151 | 1079 | Post-Boss |
| 2152 | 1079 | Normal (Protected) |
| 2153 | 1079 | Normal |
| 2154 | 1079 | Normal |
| 2155 | 1080 | Normal |
| 2156 | 1080 | Normal |
| 2157 | 1081 | Normal |
| 2158 | 1081 | Normal |
| 2159 | 1082 | Normal |
| 2160 | 1083 | ️ Boss |
| 2161 | 1084 | Post-Boss |
| 2162 | 1084 | Normal (Protected) |
| 2163 | 1084 | Normal |
| 2164 | 1084 | Normal |
| 2165 | 1085 | Normal |
| 2166 | 1085 | Normal |
| 2167 | 1086 | Normal |
| 2168 | 1086 | Normal |
| 2169 | 1087 | Normal |
| 2170 | 1088 | ️ Boss |
| 2171 | 1089 | Post-Boss |
| 2172 | 1089 | Normal (Protected) |
| 2173 | 1089 | Normal |
| 2174 | 1089 | Normal |
| 2175 | 1090 | Normal |
| 2176 | 1090 | Normal |
| 2177 | 1091 | Normal |
| 2178 | 1091 | Normal |
| 2179 | 1092 | Normal |
| 2180 | 1093 | ️ Boss |
| 2181 | 1094 | Post-Boss |
| 2182 | 1094 | Normal (Protected) |
| 2183 | 1094 | Normal |
| 2184 | 1094 | Normal |
| 2185 | 1095 | Normal |
| 2186 | 1095 | Normal |
| 2187 | 1096 | Normal |
| 2188 | 1096 | Normal |
| 2189 | 1097 | Normal |
| 2190 | 1098 | ️ Boss |
| 2191 | 1099 | Post-Boss |
| 2192 | 1099 | Normal (Protected) |
| 2193 | 1099 | Normal |
| 2194 | 1099 | Normal |
| 2195 | 1100 | Normal |
| 2196 | 1100 | Normal |
| 2197 | 1101 | Normal |
| 2198 | 1101 | Normal |
| 2199 | 1102 | Normal |
| 2200 | 1103 | ️ Boss |
| 2201 | 1104 | Post-Boss |
| 2202 | 1104 | Normal (Protected) |
| 2203 | 1104 | Normal |
| 2204 | 1104 | Normal |
| 2205 | 1105 | Normal |
| 2206 | 1105 | Normal |
| 2207 | 1106 | Normal |
| 2208 | 1106 | Normal |
| 2209 | 1107 | Normal |
| 2210 | 1108 | ️ Boss |
| 2211 | 1109 | Post-Boss |
| 2212 | 1109 | Normal (Protected) |
| 2213 | 1109 | Normal |
| 2214 | 1109 | Normal |
| 2215 | 1110 | Normal |
| 2216 | 1110 | Normal |
| 2217 | 1111 | Normal |
| 2218 | 1111 | Normal |
| 2219 | 1112 | Normal |
| 2220 | 1113 | ️ Boss |
| 2221 | 1114 | Post-Boss |
| 2222 | 1114 | Normal (Protected) |
| 2223 | 1114 | Normal |
| 2224 | 1114 | Normal |
| 2225 | 1115 | Normal |
| 2226 | 1115 | Normal |
| 2227 | 1116 | Normal |
| 2228 | 1116 | Normal |
| 2229 | 1117 | Normal |
| 2230 | 1118 | ️ Boss |
| 2231 | 1119 | Post-Boss |
| 2232 | 1119 | Normal (Protected) |
| 2233 | 1119 | Normal |
| 2234 | 1119 | Normal |
| 2235 | 1120 | Normal |
| 2236 | 1120 | Normal |
| 2237 | 1121 | Normal |
| 2238 | 1121 | Normal |
| 2239 | 1122 | Normal |
| 2240 | 1123 | ️ Boss |
| 2241 | 1124 | Post-Boss |
| 2242 | 1124 | Normal (Protected) |
| 2243 | 1124 | Normal |
| 2244 | 1124 | Normal |
| 2245 | 1125 | Normal |
| 2246 | 1125 | Normal |
| 2247 | 1126 | Normal |
| 2248 | 1126 | Normal |
| 2249 | 1127 | Normal |
| 2250 | 1128 | ️ Boss |
| 2251 | 1129 | Post-Boss |
| 2252 | 1129 | Normal (Protected) |
| 2253 | 1129 | Normal |
| 2254 | 1129 | Normal |
| 2255 | 1130 | Normal |
| 2256 | 1130 | Normal |
| 2257 | 1131 | Normal |
| 2258 | 1131 | Normal |
| 2259 | 1132 | Normal |
| 2260 | 1133 | ️ Boss |
| 2261 | 1134 | Post-Boss |
| 2262 | 1134 | Normal (Protected) |
| 2263 | 1134 | Normal |
| 2264 | 1134 | Normal |
| 2265 | 1135 | Normal |
| 2266 | 1135 | Normal |
| 2267 | 1136 | Normal |
| 2268 | 1136 | Normal |
| 2269 | 1137 | Normal |
| 2270 | 1138 | ️ Boss |
| 2271 | 1139 | Post-Boss |
| 2272 | 1139 | Normal (Protected) |
| 2273 | 1139 | Normal |
| 2274 | 1139 | Normal |
| 2275 | 1140 | Normal |
| 2276 | 1140 | Normal |
| 2277 | 1141 | Normal |
| 2278 | 1141 | Normal |
| 2279 | 1142 | Normal |
| 2280 | 1143 | ️ Boss |
| 2281 | 1144 | Post-Boss |
| 2282 | 1144 | Normal (Protected) |
| 2283 | 1144 | Normal |
| 2284 | 1144 | Normal |
| 2285 | 1145 | Normal |
| 2286 | 1145 | Normal |
| 2287 | 1146 | Normal |
| 2288 | 1146 | Normal |
| 2289 | 1147 | Normal |
| 2290 | 1148 | ️ Boss |
| 2291 | 1149 | Post-Boss |
| 2292 | 1149 | Normal (Protected) |
| 2293 | 1149 | Normal |
| 2294 | 1149 | Normal |
| 2295 | 1150 | Normal |
| 2296 | 1150 | Normal |
| 2297 | 1151 | Normal |
| 2298 | 1151 | Normal |
| 2299 | 1152 | Normal |
| 2300 | 1153 | ️ Boss |
| 2301 | 1154 | Post-Boss |
| 2302 | 1154 | Normal (Protected) |
| 2303 | 1154 | Normal |
| 2304 | 1154 | Normal |
| 2305 | 1155 | Normal |
| 2306 | 1155 | Normal |
| 2307 | 1156 | Normal |
| 2308 | 1156 | Normal |
| 2309 | 1157 | Normal |
| 2310 | 1158 | ️ Boss |
| 2311 | 1159 | Post-Boss |
| 2312 | 1159 | Normal (Protected) |
| 2313 | 1159 | Normal |
| 2314 | 1159 | Normal |
| 2315 | 1160 | Normal |
| 2316 | 1160 | Normal |
| 2317 | 1161 | Normal |
| 2318 | 1161 | Normal |
| 2319 | 1162 | Normal |
| 2320 | 1163 | ️ Boss |
| 2321 | 1164 | Post-Boss |
| 2322 | 1164 | Normal (Protected) |
| 2323 | 1164 | Normal |
| 2324 | 1164 | Normal |
| 2325 | 1165 | Normal |
| 2326 | 1165 | Normal |
| 2327 | 1166 | Normal |
| 2328 | 1166 | Normal |
| 2329 | 1167 | Normal |
| 2330 | 1168 | ️ Boss |
| 2331 | 1169 | Post-Boss |
| 2332 | 1169 | Normal (Protected) |
| 2333 | 1169 | Normal |
| 2334 | 1169 | Normal |
| 2335 | 1170 | Normal |
| 2336 | 1170 | Normal |
| 2337 | 1171 | Normal |
| 2338 | 1171 | Normal |
| 2339 | 1172 | Normal |
| 2340 | 1173 | ️ Boss |
| 2341 | 1174 | Post-Boss |
| 2342 | 1174 | Normal (Protected) |
| 2343 | 1174 | Normal |
| 2344 | 1174 | Normal |
| 2345 | 1175 | Normal |
| 2346 | 1175 | Normal |
| 2347 | 1176 | Normal |
| 2348 | 1176 | Normal |
| 2349 | 1177 | Normal |
| 2350 | 1178 | ️ Boss |
| 2351 | 1179 | Post-Boss |
| 2352 | 1179 | Normal (Protected) |
| 2353 | 1179 | Normal |
| 2354 | 1179 | Normal |
| 2355 | 1180 | Normal |
| 2356 | 1180 | Normal |
| 2357 | 1181 | Normal |
| 2358 | 1181 | Normal |
| 2359 | 1182 | Normal |
| 2360 | 1183 | ️ Boss |
| 2361 | 1184 | Post-Boss |
| 2362 | 1184 | Normal (Protected) |
| 2363 | 1184 | Normal |
| 2364 | 1184 | Normal |
| 2365 | 1185 | Normal |
| 2366 | 1185 | Normal |
| 2367 | 1186 | Normal |
| 2368 | 1186 | Normal |
| 2369 | 1187 | Normal |
| 2370 | 1188 | ️ Boss |
| 2371 | 1189 | Post-Boss |
| 2372 | 1189 | Normal (Protected) |
| 2373 | 1189 | Normal |
| 2374 | 1189 | Normal |
| 2375 | 1190 | Normal |
| 2376 | 1190 | Normal |
| 2377 | 1191 | Normal |
| 2378 | 1191 | Normal |
| 2379 | 1192 | Normal |
| 2380 | 1193 | ️ Boss |
| 2381 | 1194 | Post-Boss |
| 2382 | 1194 | Normal (Protected) |
| 2383 | 1194 | Normal |
| 2384 | 1194 | Normal |
| 2385 | 1195 | Normal |
| 2386 | 1195 | Normal |
| 2387 | 1196 | Normal |
| 2388 | 1196 | Normal |
| 2389 | 1197 | Normal |
| 2390 | 1198 | ️ Boss |
| 2391 | 1199 | Post-Boss |
| 2392 | 1199 | Normal (Protected) |
| 2393 | 1199 | Normal |
| 2394 | 1199 | Normal |
| 2395 | 1200 | Normal |
| 2396 | 1200 | Normal |
| 2397 | 1201 | Normal |
| 2398 | 1201 | Normal |
| 2399 | 1202 | Normal |
| 2400 | 1203 | ️ Boss |
| 2401 | 1204 | Post-Boss |
| 2402 | 1204 | Normal (Protected) |
| 2403 | 1204 | Normal |
| 2404 | 1204 | Normal |
| 2405 | 1205 | Normal |
| 2406 | 1205 | Normal |
| 2407 | 1206 | Normal |
| 2408 | 1206 | Normal |
| 2409 | 1207 | Normal |
| 2410 | 1208 | ️ Boss |
| 2411 | 1209 | Post-Boss |
| 2412 | 1209 | Normal (Protected) |
| 2413 | 1209 | Normal |
| 2414 | 1209 | Normal |
| 2415 | 1210 | Normal |
| 2416 | 1210 | Normal |
| 2417 | 1211 | Normal |
| 2418 | 1211 | Normal |
| 2419 | 1212 | Normal |
| 2420 | 1213 | ️ Boss |
| 2421 | 1214 | Post-Boss |
| 2422 | 1214 | Normal (Protected) |
| 2423 | 1214 | Normal |
| 2424 | 1214 | Normal |
| 2425 | 1215 | Normal |
| 2426 | 1215 | Normal |
| 2427 | 1216 | Normal |
| 2428 | 1216 | Normal |
| 2429 | 1217 | Normal |
| 2430 | 1218 | ️ Boss |
| 2431 | 1219 | Post-Boss |
| 2432 | 1219 | Normal (Protected) |
| 2433 | 1219 | Normal |
| 2434 | 1219 | Normal |
| 2435 | 1220 | Normal |
| 2436 | 1220 | Normal |
| 2437 | 1221 | Normal |
| 2438 | 1221 | Normal |
| 2439 | 1222 | Normal |
| 2440 | 1223 | ️ Boss |
| 2441 | 1224 | Post-Boss |
| 2442 | 1224 | Normal (Protected) |
| 2443 | 1224 | Normal |
| 2444 | 1224 | Normal |
| 2445 | 1225 | Normal |
| 2446 | 1225 | Normal |
| 2447 | 1226 | Normal |
| 2448 | 1226 | Normal |
| 2449 | 1227 | Normal |
| 2450 | 1228 | ️ Boss |
| 2451 | 1229 | Post-Boss |
| 2452 | 1229 | Normal (Protected) |
| 2453 | 1229 | Normal |
| 2454 | 1229 | Normal |
| 2455 | 1230 | Normal |
| 2456 | 1230 | Normal |
| 2457 | 1231 | Normal |
| 2458 | 1231 | Normal |
| 2459 | 1232 | Normal |
| 2460 | 1233 | ️ Boss |
| 2461 | 1234 | Post-Boss |
| 2462 | 1234 | Normal (Protected) |
| 2463 | 1234 | Normal |
| 2464 | 1234 | Normal |
| 2465 | 1235 | Normal |
| 2466 | 1235 | Normal |
| 2467 | 1236 | Normal |
| 2468 | 1236 | Normal |
| 2469 | 1237 | Normal |
| 2470 | 1238 | ️ Boss |
| 2471 | 1239 | Post-Boss |
| 2472 | 1239 | Normal (Protected) |
| 2473 | 1239 | Normal |
| 2474 | 1239 | Normal |
| 2475 | 1240 | Normal |
| 2476 | 1240 | Normal |
| 2477 | 1241 | Normal |
| 2478 | 1241 | Normal |
| 2479 | 1242 | Normal |
| 2480 | 1243 | ️ Boss |
| 2481 | 1244 | Post-Boss |
| 2482 | 1244 | Normal (Protected) |
| 2483 | 1244 | Normal |
| 2484 | 1244 | Normal |
| 2485 | 1245 | Normal |
| 2486 | 1245 | Normal |
| 2487 | 1246 | Normal |
| 2488 | 1246 | Normal |
| 2489 | 1247 | Normal |
| 2490 | 1248 | ️ Boss |
| 2491 | 1249 | Post-Boss |
| 2492 | 1249 | Normal (Protected) |
| 2493 | 1249 | Normal |
| 2494 | 1249 | Normal |
| 2495 | 1250 | Normal |
| 2496 | 1250 | Normal |
| 2497 | 1251 | Normal |
| 2498 | 1251 | Normal |
| 2499 | 1252 | Normal |
| 2500 | 1253 | ️ Boss |
| 2501 | 1254 | Post-Boss |
| 2502 | 1254 | Normal (Protected) |
| 2503 | 1254 | Normal |
| 2504 | 1254 | Normal |
| 2505 | 1255 | Normal |
| 2506 | 1255 | Normal |
| 2507 | 1256 | Normal |
| 2508 | 1256 | Normal |
| 2509 | 1257 | Normal |
| 2510 | 1258 | ️ Boss |
| 2511 | 1259 | Post-Boss |
| 2512 | 1259 | Normal (Protected) |
| 2513 | 1259 | Normal |
| 2514 | 1259 | Normal |
| 2515 | 1260 | Normal |
| 2516 | 1260 | Normal |
| 2517 | 1261 | Normal |
| 2518 | 1261 | Normal |
| 2519 | 1262 | Normal |
| 2520 | 1263 | ️ Boss |
| 2521 | 1264 | Post-Boss |
| 2522 | 1264 | Normal (Protected) |
| 2523 | 1264 | Normal |
| 2524 | 1264 | Normal |
| 2525 | 1265 | Normal |
| 2526 | 1265 | Normal |
| 2527 | 1266 | Normal |
| 2528 | 1266 | Normal |
| 2529 | 1267 | Normal |
| 2530 | 1268 | ️ Boss |
| 2531 | 1269 | Post-Boss |
| 2532 | 1269 | Normal (Protected) |
| 2533 | 1269 | Normal |
| 2534 | 1269 | Normal |
| 2535 | 1270 | Normal |
| 2536 | 1270 | Normal |
| 2537 | 1271 | Normal |
| 2538 | 1271 | Normal |
| 2539 | 1272 | Normal |
| 2540 | 1273 | ️ Boss |
| 2541 | 1274 | Post-Boss |
| 2542 | 1274 | Normal (Protected) |
| 2543 | 1274 | Normal |
| 2544 | 1274 | Normal |
| 2545 | 1275 | Normal |
| 2546 | 1275 | Normal |
| 2547 | 1276 | Normal |
| 2548 | 1276 | Normal |
| 2549 | 1277 | Normal |
| 2550 | 1278 | ️ Boss |
| 2551 | 1279 | Post-Boss |
| 2552 | 1279 | Normal (Protected) |
| 2553 | 1279 | Normal |
| 2554 | 1279 | Normal |
| 2555 | 1280 | Normal |
| 2556 | 1280 | Normal |
| 2557 | 1281 | Normal |
| 2558 | 1281 | Normal |
| 2559 | 1282 | Normal |
| 2560 | 1283 | ️ Boss |
| 2561 | 1284 | Post-Boss |
| 2562 | 1284 | Normal (Protected) |
| 2563 | 1284 | Normal |
| 2564 | 1284 | Normal |
| 2565 | 1285 | Normal |
| 2566 | 1285 | Normal |
| 2567 | 1286 | Normal |
| 2568 | 1286 | Normal |
| 2569 | 1287 | Normal |
| 2570 | 1288 | ️ Boss |
| 2571 | 1289 | Post-Boss |
| 2572 | 1289 | Normal (Protected) |
| 2573 | 1289 | Normal |
| 2574 | 1289 | Normal |
| 2575 | 1290 | Normal |
| 2576 | 1290 | Normal |
| 2577 | 1291 | Normal |
| 2578 | 1291 | Normal |
| 2579 | 1292 | Normal |
| 2580 | 1293 | ️ Boss |
| 2581 | 1294 | Post-Boss |
| 2582 | 1294 | Normal (Protected) |
| 2583 | 1294 | Normal |
| 2584 | 1294 | Normal |
| 2585 | 1295 | Normal |
| 2586 | 1295 | Normal |
| 2587 | 1296 | Normal |
| 2588 | 1296 | Normal |
| 2589 | 1297 | Normal |
| 2590 | 1298 | ️ Boss |
| 2591 | 1299 | Post-Boss |
| 2592 | 1299 | Normal (Protected) |
| 2593 | 1299 | Normal |
| 2594 | 1299 | Normal |
| 2595 | 1300 | Normal |
| 2596 | 1300 | Normal |
| 2597 | 1301 | Normal |
| 2598 | 1301 | Normal |
| 2599 | 1302 | Normal |
| 2600 | 1303 | ️ Boss |
| 2601 | 1304 | Post-Boss |
| 2602 | 1304 | Normal (Protected) |
| 2603 | 1304 | Normal |
| 2604 | 1304 | Normal |
| 2605 | 1305 | Normal |
| 2606 | 1305 | Normal |
| 2607 | 1306 | Normal |
| 2608 | 1306 | Normal |
| 2609 | 1307 | Normal |
| 2610 | 1308 | ️ Boss |
| 2611 | 1309 | Post-Boss |
| 2612 | 1309 | Normal (Protected) |
| 2613 | 1309 | Normal |
| 2614 | 1309 | Normal |
| 2615 | 1310 | Normal |
| 2616 | 1310 | Normal |
| 2617 | 1311 | Normal |
| 2618 | 1311 | Normal |
| 2619 | 1312 | Normal |
| 2620 | 1313 | ️ Boss |
| 2621 | 1314 | Post-Boss |
| 2622 | 1314 | Normal (Protected) |
| 2623 | 1314 | Normal |
| 2624 | 1314 | Normal |
| 2625 | 1315 | Normal |
| 2626 | 1315 | Normal |
| 2627 | 1316 | Normal |
| 2628 | 1316 | Normal |
| 2629 | 1317 | Normal |
| 2630 | 1318 | ️ Boss |
| 2631 | 1319 | Post-Boss |
| 2632 | 1319 | Normal (Protected) |
| 2633 | 1319 | Normal |
| 2634 | 1319 | Normal |
| 2635 | 1320 | Normal |
| 2636 | 1320 | Normal |
| 2637 | 1321 | Normal |
| 2638 | 1321 | Normal |
| 2639 | 1322 | Normal |
| 2640 | 1323 | ️ Boss |
| 2641 | 1324 | Post-Boss |
| 2642 | 1324 | Normal (Protected) |
| 2643 | 1324 | Normal |
| 2644 | 1324 | Normal |
| 2645 | 1325 | Normal |
| 2646 | 1325 | Normal |
| 2647 | 1326 | Normal |
| 2648 | 1326 | Normal |
| 2649 | 1327 | Normal |
| 2650 | 1328 | ️ Boss |
| 2651 | 1329 | Post-Boss |
| 2652 | 1329 | Normal (Protected) |
| 2653 | 1329 | Normal |
| 2654 | 1329 | Normal |
| 2655 | 1330 | Normal |
| 2656 | 1330 | Normal |
| 2657 | 1331 | Normal |
| 2658 | 1331 | Normal |
| 2659 | 1332 | Normal |
| 2660 | 1333 | ️ Boss |
| 2661 | 1334 | Post-Boss |
| 2662 | 1334 | Normal (Protected) |
| 2663 | 1334 | Normal |
| 2664 | 1334 | Normal |
| 2665 | 1335 | Normal |
| 2666 | 1335 | Normal |
| 2667 | 1336 | Normal |
| 2668 | 1336 | Normal |
| 2669 | 1337 | Normal |
| 2670 | 1338 | ️ Boss |
| 2671 | 1339 | Post-Boss |
| 2672 | 1339 | Normal (Protected) |
| 2673 | 1339 | Normal |
| 2674 | 1339 | Normal |
| 2675 | 1340 | Normal |
| 2676 | 1340 | Normal |
| 2677 | 1341 | Normal |
| 2678 | 1341 | Normal |
| 2679 | 1342 | Normal |
| 2680 | 1343 | ️ Boss |
| 2681 | 1344 | Post-Boss |
| 2682 | 1344 | Normal (Protected) |
| 2683 | 1344 | Normal |
| 2684 | 1344 | Normal |
| 2685 | 1345 | Normal |
| 2686 | 1345 | Normal |
| 2687 | 1346 | Normal |
| 2688 | 1346 | Normal |
| 2689 | 1347 | Normal |
| 2690 | 1348 | ️ Boss |
| 2691 | 1349 | Post-Boss |
| 2692 | 1349 | Normal (Protected) |
| 2693 | 1349 | Normal |
| 2694 | 1349 | Normal |
| 2695 | 1350 | Normal |
| 2696 | 1350 | Normal |
| 2697 | 1351 | Normal |
| 2698 | 1351 | Normal |
| 2699 | 1352 | Normal |
| 2700 | 1353 | ️ Boss |
| 2701 | 1354 | Post-Boss |
| 2702 | 1354 | Normal (Protected) |
| 2703 | 1354 | Normal |
| 2704 | 1354 | Normal |
| 2705 | 1355 | Normal |
| 2706 | 1355 | Normal |
| 2707 | 1356 | Normal |
| 2708 | 1356 | Normal |
| 2709 | 1357 | Normal |
| 2710 | 1358 | ️ Boss |
| 2711 | 1359 | Post-Boss |
| 2712 | 1359 | Normal (Protected) |
| 2713 | 1359 | Normal |
| 2714 | 1359 | Normal |
| 2715 | 1360 | Normal |
| 2716 | 1360 | Normal |
| 2717 | 1361 | Normal |
| 2718 | 1361 | Normal |
| 2719 | 1362 | Normal |
| 2720 | 1363 | ️ Boss |
| 2721 | 1364 | Post-Boss |
| 2722 | 1364 | Normal (Protected) |
| 2723 | 1364 | Normal |
| 2724 | 1364 | Normal |
| 2725 | 1365 | Normal |
| 2726 | 1365 | Normal |
| 2727 | 1366 | Normal |
| 2728 | 1366 | Normal |
| 2729 | 1367 | Normal |
| 2730 | 1368 | ️ Boss |
| 2731 | 1369 | Post-Boss |
| 2732 | 1369 | Normal (Protected) |
| 2733 | 1369 | Normal |
| 2734 | 1369 | Normal |
| 2735 | 1370 | Normal |
| 2736 | 1370 | Normal |
| 2737 | 1371 | Normal |
| 2738 | 1371 | Normal |
| 2739 | 1372 | Normal |
| 2740 | 1373 | ️ Boss |
| 2741 | 1374 | Post-Boss |
| 2742 | 1374 | Normal (Protected) |
| 2743 | 1374 | Normal |
| 2744 | 1374 | Normal |
| 2745 | 1375 | Normal |
| 2746 | 1375 | Normal |
| 2747 | 1376 | Normal |
| 2748 | 1376 | Normal |
| 2749 | 1377 | Normal |
| 2750 | 1378 | ️ Boss |
| 2751 | 1379 | Post-Boss |
| 2752 | 1379 | Normal (Protected) |
| 2753 | 1379 | Normal |
| 2754 | 1379 | Normal |
| 2755 | 1380 | Normal |
| 2756 | 1380 | Normal |
| 2757 | 1381 | Normal |
| 2758 | 1381 | Normal |
| 2759 | 1382 | Normal |
| 2760 | 1383 | ️ Boss |
| 2761 | 1384 | Post-Boss |
| 2762 | 1384 | Normal (Protected) |
| 2763 | 1384 | Normal |
| 2764 | 1384 | Normal |
| 2765 | 1385 | Normal |
| 2766 | 1385 | Normal |
| 2767 | 1386 | Normal |
| 2768 | 1386 | Normal |
| 2769 | 1387 | Normal |
| 2770 | 1388 | ️ Boss |
| 2771 | 1389 | Post-Boss |
| 2772 | 1389 | Normal (Protected) |
| 2773 | 1389 | Normal |
| 2774 | 1389 | Normal |
| 2775 | 1390 | Normal |
| 2776 | 1390 | Normal |
| 2777 | 1391 | Normal |
| 2778 | 1391 | Normal |
| 2779 | 1392 | Normal |
| 2780 | 1393 | ️ Boss |
| 2781 | 1394 | Post-Boss |
| 2782 | 1394 | Normal (Protected) |
| 2783 | 1394 | Normal |
| 2784 | 1394 | Normal |
| 2785 | 1395 | Normal |
| 2786 | 1395 | Normal |
| 2787 | 1396 | Normal |
| 2788 | 1396 | Normal |
| 2789 | 1397 | Normal |
| 2790 | 1398 | ️ Boss |
| 2791 | 1399 | Post-Boss |
| 2792 | 1399 | Normal (Protected) |
| 2793 | 1399 | Normal |
| 2794 | 1399 | Normal |
| 2795 | 1400 | Normal |
| 2796 | 1400 | Normal |
| 2797 | 1401 | Normal |
| 2798 | 1401 | Normal |
| 2799 | 1402 | Normal |
| 2800 | 1403 | ️ Boss |
| 2801 | 1404 | Post-Boss |
| 2802 | 1404 | Normal (Protected) |
| 2803 | 1404 | Normal |
| 2804 | 1404 | Normal |
| 2805 | 1405 | Normal |
| 2806 | 1405 | Normal |
| 2807 | 1406 | Normal |
| 2808 | 1406 | Normal |
| 2809 | 1407 | Normal |
| 2810 | 1408 | ️ Boss |
| 2811 | 1409 | Post-Boss |
| 2812 | 1409 | Normal (Protected) |
| 2813 | 1409 | Normal |
| 2814 | 1409 | Normal |
| 2815 | 1410 | Normal |
| 2816 | 1410 | Normal |
| 2817 | 1411 | Normal |
| 2818 | 1411 | Normal |
| 2819 | 1412 | Normal |
| 2820 | 1413 | ️ Boss |
| 2821 | 1414 | Post-Boss |
| 2822 | 1414 | Normal (Protected) |
| 2823 | 1414 | Normal |
| 2824 | 1414 | Normal |
| 2825 | 1415 | Normal |
| 2826 | 1415 | Normal |
| 2827 | 1416 | Normal |
| 2828 | 1416 | Normal |
| 2829 | 1417 | Normal |
| 2830 | 1418 | ️ Boss |
| 2831 | 1419 | Post-Boss |
| 2832 | 1419 | Normal (Protected) |
| 2833 | 1419 | Normal |
| 2834 | 1419 | Normal |
| 2835 | 1420 | Normal |
| 2836 | 1420 | Normal |
| 2837 | 1421 | Normal |
| 2838 | 1421 | Normal |
| 2839 | 1422 | Normal |
| 2840 | 1423 | ️ Boss |
| 2841 | 1424 | Post-Boss |
| 2842 | 1424 | Normal (Protected) |
| 2843 | 1424 | Normal |
| 2844 | 1424 | Normal |
| 2845 | 1425 | Normal |
| 2846 | 1425 | Normal |
| 2847 | 1426 | Normal |
| 2848 | 1426 | Normal |
| 2849 | 1427 | Normal |
| 2850 | 1428 | ️ Boss |
| 2851 | 1429 | Post-Boss |
| 2852 | 1429 | Normal (Protected) |
| 2853 | 1429 | Normal |
| 2854 | 1429 | Normal |
| 2855 | 1430 | Normal |
| 2856 | 1430 | Normal |
| 2857 | 1431 | Normal |
| 2858 | 1431 | Normal |
| 2859 | 1432 | Normal |
| 2860 | 1433 | ️ Boss |
| 2861 | 1434 | Post-Boss |
| 2862 | 1434 | Normal (Protected) |
| 2863 | 1434 | Normal |
| 2864 | 1434 | Normal |
| 2865 | 1435 | Normal |
| 2866 | 1435 | Normal |
| 2867 | 1436 | Normal |
| 2868 | 1436 | Normal |
| 2869 | 1437 | Normal |
| 2870 | 1438 | ️ Boss |
| 2871 | 1439 | Post-Boss |
| 2872 | 1439 | Normal (Protected) |
| 2873 | 1439 | Normal |
| 2874 | 1439 | Normal |
| 2875 | 1440 | Normal |
| 2876 | 1440 | Normal |
| 2877 | 1441 | Normal |
| 2878 | 1441 | Normal |
| 2879 | 1442 | Normal |
| 2880 | 1443 | ️ Boss |
| 2881 | 1444 | Post-Boss |
| 2882 | 1444 | Normal (Protected) |
| 2883 | 1444 | Normal |
| 2884 | 1444 | Normal |
| 2885 | 1445 | Normal |
| 2886 | 1445 | Normal |
| 2887 | 1446 | Normal |
| 2888 | 1446 | Normal |
| 2889 | 1447 | Normal |
| 2890 | 1448 | ️ Boss |
| 2891 | 1449 | Post-Boss |
| 2892 | 1449 | Normal (Protected) |
| 2893 | 1449 | Normal |
| 2894 | 1449 | Normal |
| 2895 | 1450 | Normal |
| 2896 | 1450 | Normal |
| 2897 | 1451 | Normal |
| 2898 | 1451 | Normal |
| 2899 | 1452 | Normal |
| 2900 | 1453 | ️ Boss |
| 2901 | 1454 | Post-Boss |
| 2902 | 1454 | Normal (Protected) |
| 2903 | 1454 | Normal |
| 2904 | 1454 | Normal |
| 2905 | 1455 | Normal |
| 2906 | 1455 | Normal |
| 2907 | 1456 | Normal |
| 2908 | 1456 | Normal |
| 2909 | 1457 | Normal |
| 2910 | 1458 | ️ Boss |
| 2911 | 1459 | Post-Boss |
| 2912 | 1459 | Normal (Protected) |
| 2913 | 1459 | Normal |
| 2914 | 1459 | Normal |
| 2915 | 1460 | Normal |
| 2916 | 1460 | Normal |
| 2917 | 1461 | Normal |
| 2918 | 1461 | Normal |
| 2919 | 1462 | Normal |
| 2920 | 1463 | ️ Boss |
| 2921 | 1464 | Post-Boss |
| 2922 | 1464 | Normal (Protected) |
| 2923 | 1464 | Normal |
| 2924 | 1464 | Normal |
| 2925 | 1465 | Normal |
| 2926 | 1465 | Normal |
| 2927 | 1466 | Normal |
| 2928 | 1466 | Normal |
| 2929 | 1467 | Normal |
| 2930 | 1468 | ️ Boss |
| 2931 | 1469 | Post-Boss |
| 2932 | 1469 | Normal (Protected) |
| 2933 | 1469 | Normal |
| 2934 | 1469 | Normal |
| 2935 | 1470 | Normal |
| 2936 | 1470 | Normal |
| 2937 | 1471 | Normal |
| 2938 | 1471 | Normal |
| 2939 | 1472 | Normal |
| 2940 | 1473 | ️ Boss |
| 2941 | 1474 | Post-Boss |
| 2942 | 1474 | Normal (Protected) |
| 2943 | 1474 | Normal |
| 2944 | 1474 | Normal |
| 2945 | 1475 | Normal |
| 2946 | 1475 | Normal |
| 2947 | 1476 | Normal |
| 2948 | 1476 | Normal |
| 2949 | 1477 | Normal |
| 2950 | 1478 | ️ Boss |
| 2951 | 1479 | Post-Boss |
| 2952 | 1479 | Normal (Protected) |
| 2953 | 1479 | Normal |
| 2954 | 1479 | Normal |
| 2955 | 1480 | Normal |
| 2956 | 1480 | Normal |
| 2957 | 1481 | Normal |
| 2958 | 1481 | Normal |
| 2959 | 1482 | Normal |
| 2960 | 1483 | ️ Boss |
| 2961 | 1484 | Post-Boss |
| 2962 | 1484 | Normal (Protected) |
| 2963 | 1484 | Normal |
| 2964 | 1484 | Normal |
| 2965 | 1485 | Normal |
| 2966 | 1485 | Normal |
| 2967 | 1486 | Normal |
| 2968 | 1486 | Normal |
| 2969 | 1487 | Normal |
| 2970 | 1488 | ️ Boss |
| 2971 | 1489 | Post-Boss |
| 2972 | 1489 | Normal (Protected) |
| 2973 | 1489 | Normal |
| 2974 | 1489 | Normal |
| 2975 | 1490 | Normal |
| 2976 | 1490 | Normal |
| 2977 | 1491 | Normal |
| 2978 | 1491 | Normal |
| 2979 | 1492 | Normal |
| 2980 | 1493 | ️ Boss |
| 2981 | 1494 | Post-Boss |
| 2982 | 1494 | Normal (Protected) |
| 2983 | 1494 | Normal |
| 2984 | 1494 | Normal |
| 2985 | 1495 | Normal |
| 2986 | 1495 | Normal |
| 2987 | 1496 | Normal |
| 2988 | 1496 | Normal |
| 2989 | 1497 | Normal |
| 2990 | 1498 | ️ Boss |
| 2991 | 1499 | Post-Boss |
| 2992 | 1499 | Normal (Protected) |
| 2993 | 1499 | Normal |
| 2994 | 1499 | Normal |
| 2995 | 1500 | Normal |
| 2996 | 1500 | Normal |
| 2997 | 1501 | Normal |
| 2998 | 1501 | Normal |
| 2999 | 1502 | Normal |
| 3000 | 1503 | ️ Boss |
| 3001 | 1504 | Post-Boss |
| 3002 | 1504 | Normal (Protected) |
| 3003 | 1504 | Normal |
| 3004 | 1504 | Normal |
| 3005 | 1505 | Normal |
| 3006 | 1505 | Normal |
| 3007 | 1506 | Normal |
| 3008 | 1506 | Normal |
| 3009 | 1507 | Normal |
| 3010 | 1508 | ️ Boss |
| 3011 | 1509 | Post-Boss |
| 3012 | 1509 | Normal (Protected) |
| 3013 | 1509 | Normal |
| 3014 | 1509 | Normal |
| 3015 | 1510 | Normal |
| 3016 | 1510 | Normal |
| 3017 | 1511 | Normal |
| 3018 | 1511 | Normal |
| 3019 | 1512 | Normal |
| 3020 | 1513 | ️ Boss |
| 3021 | 1514 | Post-Boss |
| 3022 | 1514 | Normal (Protected) |
| 3023 | 1514 | Normal |
| 3024 | 1514 | Normal |
| 3025 | 1515 | Normal |
| 3026 | 1515 | Normal |
| 3027 | 1516 | Normal |
| 3028 | 1516 | Normal |
| 3029 | 1517 | Normal |
| 3030 | 1518 | ️ Boss |
| 3031 | 1519 | Post-Boss |
| 3032 | 1519 | Normal (Protected) |
| 3033 | 1519 | Normal |
| 3034 | 1519 | Normal |
| 3035 | 1520 | Normal |
| 3036 | 1520 | Normal |
| 3037 | 1521 | Normal |
| 3038 | 1521 | Normal |
| 3039 | 1522 | Normal |
| 3040 | 1523 | ️ Boss |
| 3041 | 1524 | Post-Boss |
| 3042 | 1524 | Normal (Protected) |
| 3043 | 1524 | Normal |
| 3044 | 1524 | Normal |
| 3045 | 1525 | Normal |
| 3046 | 1525 | Normal |
| 3047 | 1526 | Normal |
| 3048 | 1526 | Normal |
| 3049 | 1527 | Normal |
| 3050 | 1528 | ️ Boss |
| 3051 | 1529 | Post-Boss |
| 3052 | 1529 | Normal (Protected) |
| 3053 | 1529 | Normal |
| 3054 | 1529 | Normal |
| 3055 | 1530 | Normal |
| 3056 | 1530 | Normal |
| 3057 | 1531 | Normal |
| 3058 | 1531 | Normal |
| 3059 | 1532 | Normal |
| 3060 | 1533 | ️ Boss |
| 3061 | 1534 | Post-Boss |
| 3062 | 1534 | Normal (Protected) |
| 3063 | 1534 | Normal |
| 3064 | 1534 | Normal |
| 3065 | 1535 | Normal |
| 3066 | 1535 | Normal |
| 3067 | 1536 | Normal |
| 3068 | 1536 | Normal |
| 3069 | 1537 | Normal |
| 3070 | 1538 | ️ Boss |
| 3071 | 1539 | Post-Boss |
| 3072 | 1539 | Normal (Protected) |
| 3073 | 1539 | Normal |
| 3074 | 1539 | Normal |
| 3075 | 1540 | Normal |
| 3076 | 1540 | Normal |
| 3077 | 1541 | Normal |
| 3078 | 1541 | Normal |
| 3079 | 1542 | Normal |
| 3080 | 1543 | ️ Boss |
| 3081 | 1544 | Post-Boss |
| 3082 | 1544 | Normal (Protected) |
| 3083 | 1544 | Normal |
| 3084 | 1544 | Normal |
| 3085 | 1545 | Normal |
| 3086 | 1545 | Normal |
| 3087 | 1546 | Normal |
| 3088 | 1546 | Normal |
| 3089 | 1547 | Normal |
| 3090 | 1548 | ️ Boss |
| 3091 | 1549 | Post-Boss |
| 3092 | 1549 | Normal (Protected) |
| 3093 | 1549 | Normal |
| 3094 | 1549 | Normal |
| 3095 | 1550 | Normal |
| 3096 | 1550 | Normal |
| 3097 | 1551 | Normal |
| 3098 | 1551 | Normal |
| 3099 | 1552 | Normal |
| 3100 | 1553 | ️ Boss |
| 3101 | 1554 | Post-Boss |
| 3102 | 1554 | Normal (Protected) |
| 3103 | 1554 | Normal |
| 3104 | 1554 | Normal |
| 3105 | 1555 | Normal |
| 3106 | 1555 | Normal |
| 3107 | 1556 | Normal |
| 3108 | 1556 | Normal |
| 3109 | 1557 | Normal |
| 3110 | 1558 | ️ Boss |
| 3111 | 1559 | Post-Boss |
| 3112 | 1559 | Normal (Protected) |
| 3113 | 1559 | Normal |
| 3114 | 1559 | Normal |
| 3115 | 1560 | Normal |
| 3116 | 1560 | Normal |
| 3117 | 1561 | Normal |
| 3118 | 1561 | Normal |
| 3119 | 1562 | Normal |
| 3120 | 1563 | ️ Boss |
| 3121 | 1564 | Post-Boss |
| 3122 | 1564 | Normal (Protected) |
| 3123 | 1564 | Normal |
| 3124 | 1564 | Normal |
| 3125 | 1565 | Normal |
| 3126 | 1565 | Normal |
| 3127 | 1566 | Normal |
| 3128 | 1566 | Normal |
| 3129 | 1567 | Normal |
| 3130 | 1568 | ️ Boss |
| 3131 | 1569 | Post-Boss |
| 3132 | 1569 | Normal (Protected) |
| 3133 | 1569 | Normal |
| 3134 | 1569 | Normal |
| 3135 | 1570 | Normal |
| 3136 | 1570 | Normal |
| 3137 | 1571 | Normal |
| 3138 | 1571 | Normal |
| 3139 | 1572 | Normal |
| 3140 | 1573 | ️ Boss |
| 3141 | 1574 | Post-Boss |
| 3142 | 1574 | Normal (Protected) |
| 3143 | 1574 | Normal |
| 3144 | 1574 | Normal |
| 3145 | 1575 | Normal |
| 3146 | 1575 | Normal |
| 3147 | 1576 | Normal |
| 3148 | 1576 | Normal |
| 3149 | 1577 | Normal |
| 3150 | 1578 | ️ Boss |
| 3151 | 1579 | Post-Boss |
| 3152 | 1579 | Normal (Protected) |
| 3153 | 1579 | Normal |
| 3154 | 1579 | Normal |
| 3155 | 1580 | Normal |
| 3156 | 1580 | Normal |
| 3157 | 1581 | Normal |
| 3158 | 1581 | Normal |
| 3159 | 1582 | Normal |
| 3160 | 1583 | ️ Boss |
| 3161 | 1584 | Post-Boss |
| 3162 | 1584 | Normal (Protected) |
| 3163 | 1584 | Normal |
| 3164 | 1584 | Normal |
| 3165 | 1585 | Normal |
| 3166 | 1585 | Normal |
| 3167 | 1586 | Normal |
| 3168 | 1586 | Normal |
| 3169 | 1587 | Normal |
| 3170 | 1588 | ️ Boss |
| 3171 | 1589 | Post-Boss |
| 3172 | 1589 | Normal (Protected) |
| 3173 | 1589 | Normal |
| 3174 | 1589 | Normal |
| 3175 | 1590 | Normal |
| 3176 | 1590 | Normal |
| 3177 | 1591 | Normal |
| 3178 | 1591 | Normal |
| 3179 | 1592 | Normal |
| 3180 | 1593 | ️ Boss |
| 3181 | 1594 | Post-Boss |
| 3182 | 1594 | Normal (Protected) |
| 3183 | 1594 | Normal |
| 3184 | 1594 | Normal |
| 3185 | 1595 | Normal |
| 3186 | 1595 | Normal |
| 3187 | 1596 | Normal |
| 3188 | 1596 | Normal |
| 3189 | 1597 | Normal |
| 3190 | 1598 | ️ Boss |
| 3191 | 1599 | Post-Boss |
| 3192 | 1599 | Normal (Protected) |
| 3193 | 1599 | Normal |
| 3194 | 1599 | Normal |
| 3195 | 1600 | Normal |
| 3196 | 1600 | Normal |
| 3197 | 1601 | Normal |
| 3198 | 1601 | Normal |
| 3199 | 1602 | Normal |
| 3200 | 1603 | ️ Boss |
| 3201 | 1604 | Post-Boss |
| 3202 | 1604 | Normal (Protected) |
| 3203 | 1604 | Normal |
| 3204 | 1604 | Normal |
| 3205 | 1605 | Normal |
| 3206 | 1605 | Normal |
| 3207 | 1606 | Normal |
| 3208 | 1606 | Normal |
| 3209 | 1607 | Normal |
| 3210 | 1608 | ️ Boss |
| 3211 | 1609 | Post-Boss |
| 3212 | 1609 | Normal (Protected) |
| 3213 | 1609 | Normal |
| 3214 | 1609 | Normal |
| 3215 | 1610 | Normal |
| 3216 | 1610 | Normal |
| 3217 | 1611 | Normal |
| 3218 | 1611 | Normal |
| 3219 | 1612 | Normal |
| 3220 | 1613 | ️ Boss |
| 3221 | 1614 | Post-Boss |
| 3222 | 1614 | Normal (Protected) |
| 3223 | 1614 | Normal |
| 3224 | 1614 | Normal |
| 3225 | 1615 | Normal |
| 3226 | 1615 | Normal |
| 3227 | 1616 | Normal |
| 3228 | 1616 | Normal |
| 3229 | 1617 | Normal |
| 3230 | 1618 | ️ Boss |
| 3231 | 1619 | Post-Boss |
| 3232 | 1619 | Normal (Protected) |
| 3233 | 1619 | Normal |
| 3234 | 1619 | Normal |
| 3235 | 1620 | Normal |
| 3236 | 1620 | Normal |
| 3237 | 1621 | Normal |
| 3238 | 1621 | Normal |
| 3239 | 1622 | Normal |
| 3240 | 1623 | ️ Boss |
| 3241 | 1624 | Post-Boss |
| 3242 | 1624 | Normal (Protected) |
| 3243 | 1624 | Normal |
| 3244 | 1624 | Normal |
| 3245 | 1625 | Normal |
| 3246 | 1625 | Normal |
| 3247 | 1626 | Normal |
| 3248 | 1626 | Normal |
| 3249 | 1627 | Normal |
| 3250 | 1628 | ️ Boss |
| 3251 | 1629 | Post-Boss |
| 3252 | 1629 | Normal (Protected) |
| 3253 | 1629 | Normal |
| 3254 | 1629 | Normal |
| 3255 | 1630 | Normal |
| 3256 | 1630 | Normal |
| 3257 | 1631 | Normal |
| 3258 | 1631 | Normal |
| 3259 | 1632 | Normal |
| 3260 | 1633 | ️ Boss |
| 3261 | 1634 | Post-Boss |
| 3262 | 1634 | Normal (Protected) |
| 3263 | 1634 | Normal |
| 3264 | 1634 | Normal |
| 3265 | 1635 | Normal |
| 3266 | 1635 | Normal |
| 3267 | 1636 | Normal |
| 3268 | 1636 | Normal |
| 3269 | 1637 | Normal |
| 3270 | 1638 | ️ Boss |
| 3271 | 1639 | Post-Boss |
| 3272 | 1639 | Normal (Protected) |
| 3273 | 1639 | Normal |
| 3274 | 1639 | Normal |
| 3275 | 1640 | Normal |
| 3276 | 1640 | Normal |
| 3277 | 1641 | Normal |
| 3278 | 1641 | Normal |
| 3279 | 1642 | Normal |
| 3280 | 1643 | ️ Boss |
| 3281 | 1644 | Post-Boss |
| 3282 | 1644 | Normal (Protected) |
| 3283 | 1644 | Normal |
| 3284 | 1644 | Normal |
| 3285 | 1645 | Normal |
| 3286 | 1645 | Normal |
| 3287 | 1646 | Normal |
| 3288 | 1646 | Normal |
| 3289 | 1647 | Normal |
| 3290 | 1648 | ️ Boss |
| 3291 | 1649 | Post-Boss |
| 3292 | 1649 | Normal (Protected) |
| 3293 | 1649 | Normal |
| 3294 | 1649 | Normal |
| 3295 | 1650 | Normal |
| 3296 | 1650 | Normal |
| 3297 | 1651 | Normal |
| 3298 | 1651 | Normal |
| 3299 | 1652 | Normal |
| 3300 | 1653 | ️ Boss |
| 3301 | 1654 | Post-Boss |
| 3302 | 1654 | Normal (Protected) |
| 3303 | 1654 | Normal |
| 3304 | 1654 | Normal |
| 3305 | 1655 | Normal |
| 3306 | 1655 | Normal |
| 3307 | 1656 | Normal |
| 3308 | 1656 | Normal |
| 3309 | 1657 | Normal |
| 3310 | 1658 | ️ Boss |
| 3311 | 1659 | Post-Boss |
| 3312 | 1659 | Normal (Protected) |
| 3313 | 1659 | Normal |
| 3314 | 1659 | Normal |
| 3315 | 1660 | Normal |
| 3316 | 1660 | Normal |
| 3317 | 1661 | Normal |
| 3318 | 1661 | Normal |
| 3319 | 1662 | Normal |
| 3320 | 1663 | ️ Boss |
| 3321 | 1664 | Post-Boss |
| 3322 | 1664 | Normal (Protected) |
| 3323 | 1664 | Normal |
| 3324 | 1664 | Normal |
| 3325 | 1665 | Normal |
| 3326 | 1665 | Normal |
| 3327 | 1666 | Normal |
| 3328 | 1666 | Normal |
| 3329 | 1667 | Normal |
| 3330 | 1668 | ️ Boss |
| 3331 | 1669 | Post-Boss |
| 3332 | 1669 | Normal (Protected) |
| 3333 | 1669 | Normal |
| 3334 | 1669 | Normal |
| 3335 | 1670 | Normal |
| 3336 | 1670 | Normal |
| 3337 | 1671 | Normal |
| 3338 | 1671 | Normal |
| 3339 | 1672 | Normal |
| 3340 | 1673 | ️ Boss |
| 3341 | 1674 | Post-Boss |
| 3342 | 1674 | Normal (Protected) |
| 3343 | 1674 | Normal |
| 3344 | 1674 | Normal |
| 3345 | 1675 | Normal |
| 3346 | 1675 | Normal |
| 3347 | 1676 | Normal |
| 3348 | 1676 | Normal |
| 3349 | 1677 | Normal |
| 3350 | 1678 | ️ Boss |
| 3351 | 1679 | Post-Boss |
| 3352 | 1679 | Normal (Protected) |
| 3353 | 1679 | Normal |
| 3354 | 1679 | Normal |
| 3355 | 1680 | Normal |
| 3356 | 1680 | Normal |
| 3357 | 1681 | Normal |
| 3358 | 1681 | Normal |
| 3359 | 1682 | Normal |
| 3360 | 1683 | ️ Boss |
| 3361 | 1684 | Post-Boss |
| 3362 | 1684 | Normal (Protected) |
| 3363 | 1684 | Normal |
| 3364 | 1684 | Normal |
| 3365 | 1685 | Normal |
| 3366 | 1685 | Normal |
| 3367 | 1686 | Normal |
| 3368 | 1686 | Normal |
| 3369 | 1687 | Normal |
| 3370 | 1688 | ️ Boss |
| 3371 | 1689 | Post-Boss |
| 3372 | 1689 | Normal (Protected) |
| 3373 | 1689 | Normal |
| 3374 | 1689 | Normal |
| 3375 | 1690 | Normal |
| 3376 | 1690 | Normal |
| 3377 | 1691 | Normal |
| 3378 | 1691 | Normal |
| 3379 | 1692 | Normal |
| 3380 | 1693 | ️ Boss |
| 3381 | 1694 | Post-Boss |
| 3382 | 1694 | Normal (Protected) |
| 3383 | 1694 | Normal |
| 3384 | 1694 | Normal |
| 3385 | 1695 | Normal |
| 3386 | 1695 | Normal |
| 3387 | 1696 | Normal |
| 3388 | 1696 | Normal |
| 3389 | 1697 | Normal |
| 3390 | 1698 | ️ Boss |
| 3391 | 1699 | Post-Boss |
| 3392 | 1699 | Normal (Protected) |
| 3393 | 1699 | Normal |
| 3394 | 1699 | Normal |
| 3395 | 1700 | Normal |
| 3396 | 1700 | Normal |
| 3397 | 1701 | Normal |
| 3398 | 1701 | Normal |
| 3399 | 1702 | Normal |
| 3400 | 1703 | ️ Boss |
| 3401 | 1704 | Post-Boss |
| 3402 | 1704 | Normal (Protected) |
| 3403 | 1704 | Normal |
| 3404 | 1704 | Normal |
| 3405 | 1705 | Normal |
| 3406 | 1705 | Normal |
| 3407 | 1706 | Normal |
| 3408 | 1706 | Normal |
| 3409 | 1707 | Normal |
| 3410 | 1708 | ️ Boss |
| 3411 | 1709 | Post-Boss |
| 3412 | 1709 | Normal (Protected) |
| 3413 | 1709 | Normal |
| 3414 | 1709 | Normal |
| 3415 | 1710 | Normal |
| 3416 | 1710 | Normal |
| 3417 | 1711 | Normal |
| 3418 | 1711 | Normal |
| 3419 | 1712 | Normal |
| 3420 | 1713 | ️ Boss |
| 3421 | 1714 | Post-Boss |
| 3422 | 1714 | Normal (Protected) |
| 3423 | 1714 | Normal |
| 3424 | 1714 | Normal |
| 3425 | 1715 | Normal |
| 3426 | 1715 | Normal |
| 3427 | 1716 | Normal |
| 3428 | 1716 | Normal |
| 3429 | 1717 | Normal |
| 3430 | 1718 | ️ Boss |
| 3431 | 1719 | Post-Boss |
| 3432 | 1719 | Normal (Protected) |
| 3433 | 1719 | Normal |
| 3434 | 1719 | Normal |
| 3435 | 1720 | Normal |
| 3436 | 1720 | Normal |
| 3437 | 1721 | Normal |
| 3438 | 1721 | Normal |
| 3439 | 1722 | Normal |
| 3440 | 1723 | ️ Boss |
| 3441 | 1724 | Post-Boss |
| 3442 | 1724 | Normal (Protected) |
| 3443 | 1724 | Normal |
| 3444 | 1724 | Normal |
| 3445 | 1725 | Normal |
| 3446 | 1725 | Normal |
| 3447 | 1726 | Normal |
| 3448 | 1726 | Normal |
| 3449 | 1727 | Normal |
| 3450 | 1728 | ️ Boss |
| 3451 | 1729 | Post-Boss |
| 3452 | 1729 | Normal (Protected) |
| 3453 | 1729 | Normal |
| 3454 | 1729 | Normal |
| 3455 | 1730 | Normal |
| 3456 | 1730 | Normal |
| 3457 | 1731 | Normal |
| 3458 | 1731 | Normal |
| 3459 | 1732 | Normal |
| 3460 | 1733 | ️ Boss |
| 3461 | 1734 | Post-Boss |
| 3462 | 1734 | Normal (Protected) |
| 3463 | 1734 | Normal |
| 3464 | 1734 | Normal |
| 3465 | 1735 | Normal |
| 3466 | 1735 | Normal |
| 3467 | 1736 | Normal |
| 3468 | 1736 | Normal |
| 3469 | 1737 | Normal |
| 3470 | 1738 | ️ Boss |
| 3471 | 1739 | Post-Boss |
| 3472 | 1739 | Normal (Protected) |
| 3473 | 1739 | Normal |
| 3474 | 1739 | Normal |
| 3475 | 1740 | Normal |
| 3476 | 1740 | Normal |
| 3477 | 1741 | Normal |
| 3478 | 1741 | Normal |
| 3479 | 1742 | Normal |
| 3480 | 1743 | ️ Boss |
| 3481 | 1744 | Post-Boss |
| 3482 | 1744 | Normal (Protected) |
| 3483 | 1744 | Normal |
| 3484 | 1744 | Normal |
| 3485 | 1745 | Normal |
| 3486 | 1745 | Normal |
| 3487 | 1746 | Normal |
| 3488 | 1746 | Normal |
| 3489 | 1747 | Normal |
| 3490 | 1748 | ️ Boss |
| 3491 | 1749 | Post-Boss |
| 3492 | 1749 | Normal (Protected) |
| 3493 | 1749 | Normal |
| 3494 | 1749 | Normal |
| 3495 | 1750 | Normal |
| 3496 | 1750 | Normal |
| 3497 | 1751 | Normal |
| 3498 | 1751 | Normal |
| 3499 | 1752 | Normal |
| 3500 | 1753 | ️ Boss |
| 3501 | 1754 | Post-Boss |
| 3502 | 1754 | Normal (Protected) |
| 3503 | 1754 | Normal |
| 3504 | 1754 | Normal |
| 3505 | 1755 | Normal |
| 3506 | 1755 | Normal |
| 3507 | 1756 | Normal |
| 3508 | 1756 | Normal |
| 3509 | 1757 | Normal |
| 3510 | 1758 | ️ Boss |
| 3511 | 1759 | Post-Boss |
| 3512 | 1759 | Normal (Protected) |
| 3513 | 1759 | Normal |
| 3514 | 1759 | Normal |
| 3515 | 1760 | Normal |
| 3516 | 1760 | Normal |
| 3517 | 1761 | Normal |
| 3518 | 1761 | Normal |
| 3519 | 1762 | Normal |
| 3520 | 1763 | ️ Boss |
| 3521 | 1764 | Post-Boss |
| 3522 | 1764 | Normal (Protected) |
| 3523 | 1764 | Normal |
| 3524 | 1764 | Normal |
| 3525 | 1765 | Normal |
| 3526 | 1765 | Normal |
| 3527 | 1766 | Normal |
| 3528 | 1766 | Normal |
| 3529 | 1767 | Normal |
| 3530 | 1768 | ️ Boss |
| 3531 | 1769 | Post-Boss |
| 3532 | 1769 | Normal (Protected) |
| 3533 | 1769 | Normal |
| 3534 | 1769 | Normal |
| 3535 | 1770 | Normal |
| 3536 | 1770 | Normal |
| 3537 | 1771 | Normal |
| 3538 | 1771 | Normal |
| 3539 | 1772 | Normal |
| 3540 | 1773 | ️ Boss |
| 3541 | 1774 | Post-Boss |
| 3542 | 1774 | Normal (Protected) |
| 3543 | 1774 | Normal |
| 3544 | 1774 | Normal |
| 3545 | 1775 | Normal |
| 3546 | 1775 | Normal |
| 3547 | 1776 | Normal |
| 3548 | 1776 | Normal |
| 3549 | 1777 | Normal |
| 3550 | 1778 | ️ Boss |
| 3551 | 1779 | Post-Boss |
| 3552 | 1779 | Normal (Protected) |
| 3553 | 1779 | Normal |
| 3554 | 1779 | Normal |
| 3555 | 1780 | Normal |
| 3556 | 1780 | Normal |
| 3557 | 1781 | Normal |
| 3558 | 1781 | Normal |
| 3559 | 1782 | Normal |
| 3560 | 1783 | ️ Boss |
| 3561 | 1784 | Post-Boss |
| 3562 | 1784 | Normal (Protected) |
| 3563 | 1784 | Normal |
| 3564 | 1784 | Normal |
| 3565 | 1785 | Normal |
| 3566 | 1785 | Normal |
| 3567 | 1786 | Normal |
| 3568 | 1786 | Normal |
| 3569 | 1787 | Normal |
| 3570 | 1788 | ️ Boss |
| 3571 | 1789 | Post-Boss |
| 3572 | 1789 | Normal (Protected) |
| 3573 | 1789 | Normal |
| 3574 | 1789 | Normal |
| 3575 | 1790 | Normal |
| 3576 | 1790 | Normal |
| 3577 | 1791 | Normal |
| 3578 | 1791 | Normal |
| 3579 | 1792 | Normal |
| 3580 | 1793 | ️ Boss |
| 3581 | 1794 | Post-Boss |
| 3582 | 1794 | Normal (Protected) |
| 3583 | 1794 | Normal |
| 3584 | 1794 | Normal |
| 3585 | 1795 | Normal |
| 3586 | 1795 | Normal |
| 3587 | 1796 | Normal |
| 3588 | 1796 | Normal |
| 3589 | 1797 | Normal |
| 3590 | 1798 | ️ Boss |
| 3591 | 1799 | Post-Boss |
| 3592 | 1799 | Normal (Protected) |
| 3593 | 1799 | Normal |
| 3594 | 1799 | Normal |
| 3595 | 1800 | Normal |
| 3596 | 1800 | Normal |
| 3597 | 1801 | Normal |
| 3598 | 1801 | Normal |
| 3599 | 1802 | Normal |
| 3600 | 1803 | ️ Boss |
| 3601 | 1804 | Post-Boss |
| 3602 | 1804 | Normal (Protected) |
| 3603 | 1804 | Normal |
| 3604 | 1804 | Normal |
| 3605 | 1805 | Normal |
| 3606 | 1805 | Normal |
| 3607 | 1806 | Normal |
| 3608 | 1806 | Normal |
| 3609 | 1807 | Normal |
| 3610 | 1808 | ️ Boss |
| 3611 | 1809 | Post-Boss |
| 3612 | 1809 | Normal (Protected) |
| 3613 | 1809 | Normal |
| 3614 | 1809 | Normal |
| 3615 | 1810 | Normal |
| 3616 | 1810 | Normal |
| 3617 | 1811 | Normal |
| 3618 | 1811 | Normal |
| 3619 | 1812 | Normal |
| 3620 | 1813 | ️ Boss |
| 3621 | 1814 | Post-Boss |
| 3622 | 1814 | Normal (Protected) |
| 3623 | 1814 | Normal |
| 3624 | 1814 | Normal |
| 3625 | 1815 | Normal |
| 3626 | 1815 | Normal |
| 3627 | 1816 | Normal |
| 3628 | 1816 | Normal |
| 3629 | 1817 | Normal |
| 3630 | 1818 | ️ Boss |
| 3631 | 1819 | Post-Boss |
| 3632 | 1819 | Normal (Protected) |
| 3633 | 1819 | Normal |
| 3634 | 1819 | Normal |
| 3635 | 1820 | Normal |
| 3636 | 1820 | Normal |
| 3637 | 1821 | Normal |
| 3638 | 1821 | Normal |
| 3639 | 1822 | Normal |
| 3640 | 1823 | ️ Boss |
| 3641 | 1824 | Post-Boss |
| 3642 | 1824 | Normal (Protected) |
| 3643 | 1824 | Normal |
| 3644 | 1824 | Normal |
| 3645 | 1825 | Normal |
| 3646 | 1825 | Normal |
| 3647 | 1826 | Normal |
| 3648 | 1826 | Normal |
| 3649 | 1827 | Normal |
| 3650 | 1828 | ️ Boss |
| 3651 | 1829 | Post-Boss |
| 3652 | 1829 | Normal (Protected) |
| 3653 | 1829 | Normal |
| 3654 | 1829 | Normal |
| 3655 | 1830 | Normal |
| 3656 | 1830 | Normal |
| 3657 | 1831 | Normal |
| 3658 | 1831 | Normal |
| 3659 | 1832 | Normal |
| 3660 | 1833 | ️ Boss |
| 3661 | 1834 | Post-Boss |
| 3662 | 1834 | Normal (Protected) |
| 3663 | 1834 | Normal |
| 3664 | 1834 | Normal |
| 3665 | 1835 | Normal |
| 3666 | 1835 | Normal |
| 3667 | 1836 | Normal |
| 3668 | 1836 | Normal |
| 3669 | 1837 | Normal |
| 3670 | 1838 | ️ Boss |
| 3671 | 1839 | Post-Boss |
| 3672 | 1839 | Normal (Protected) |
| 3673 | 1839 | Normal |
| 3674 | 1839 | Normal |
| 3675 | 1840 | Normal |
| 3676 | 1840 | Normal |
| 3677 | 1841 | Normal |
| 3678 | 1841 | Normal |
| 3679 | 1842 | Normal |
| 3680 | 1843 | ️ Boss |
| 3681 | 1844 | Post-Boss |
| 3682 | 1844 | Normal (Protected) |
| 3683 | 1844 | Normal |
| 3684 | 1844 | Normal |
| 3685 | 1845 | Normal |
| 3686 | 1845 | Normal |
| 3687 | 1846 | Normal |
| 3688 | 1846 | Normal |
| 3689 | 1847 | Normal |
| 3690 | 1848 | ️ Boss |
| 3691 | 1849 | Post-Boss |
| 3692 | 1849 | Normal (Protected) |
| 3693 | 1849 | Normal |
| 3694 | 1849 | Normal |
| 3695 | 1850 | Normal |
| 3696 | 1850 | Normal |
| 3697 | 1851 | Normal |
| 3698 | 1851 | Normal |
| 3699 | 1852 | Normal |
| 3700 | 1853 | ️ Boss |
| 3701 | 1854 | Post-Boss |
| 3702 | 1854 | Normal (Protected) |
| 3703 | 1854 | Normal |
| 3704 | 1854 | Normal |
| 3705 | 1855 | Normal |
| 3706 | 1855 | Normal |
| 3707 | 1856 | Normal |
| 3708 | 1856 | Normal |
| 3709 | 1857 | Normal |
| 3710 | 1858 | ️ Boss |
| 3711 | 1859 | Post-Boss |
| 3712 | 1859 | Normal (Protected) |
| 3713 | 1859 | Normal |
| 3714 | 1859 | Normal |
| 3715 | 1860 | Normal |
| 3716 | 1860 | Normal |
| 3717 | 1861 | Normal |
| 3718 | 1861 | Normal |
| 3719 | 1862 | Normal |
| 3720 | 1863 | ️ Boss |
| 3721 | 1864 | Post-Boss |
| 3722 | 1864 | Normal (Protected) |
| 3723 | 1864 | Normal |
| 3724 | 1864 | Normal |
| 3725 | 1865 | Normal |
| 3726 | 1865 | Normal |
| 3727 | 1866 | Normal |
| 3728 | 1866 | Normal |
| 3729 | 1867 | Normal |
| 3730 | 1868 | ️ Boss |
| 3731 | 1869 | Post-Boss |
| 3732 | 1869 | Normal (Protected) |
| 3733 | 1869 | Normal |
| 3734 | 1869 | Normal |
| 3735 | 1870 | Normal |
| 3736 | 1870 | Normal |
| 3737 | 1871 | Normal |
| 3738 | 1871 | Normal |
| 3739 | 1872 | Normal |
| 3740 | 1873 | ️ Boss |
| 3741 | 1874 | Post-Boss |
| 3742 | 1874 | Normal (Protected) |
| 3743 | 1874 | Normal |
| 3744 | 1874 | Normal |
| 3745 | 1875 | Normal |
| 3746 | 1875 | Normal |
| 3747 | 1876 | Normal |
| 3748 | 1876 | Normal |
| 3749 | 1877 | Normal |
| 3750 | 1878 | ️ Boss |
| 3751 | 1879 | Post-Boss |
| 3752 | 1879 | Normal (Protected) |
| 3753 | 1879 | Normal |
| 3754 | 1879 | Normal |
| 3755 | 1880 | Normal |
| 3756 | 1880 | Normal |
| 3757 | 1881 | Normal |
| 3758 | 1881 | Normal |
| 3759 | 1882 | Normal |
| 3760 | 1883 | ️ Boss |
| 3761 | 1884 | Post-Boss |
| 3762 | 1884 | Normal (Protected) |
| 3763 | 1884 | Normal |
| 3764 | 1884 | Normal |
| 3765 | 1885 | Normal |
| 3766 | 1885 | Normal |
| 3767 | 1886 | Normal |
| 3768 | 1886 | Normal |
| 3769 | 1887 | Normal |
| 3770 | 1888 | ️ Boss |
| 3771 | 1889 | Post-Boss |
| 3772 | 1889 | Normal (Protected) |
| 3773 | 1889 | Normal |
| 3774 | 1889 | Normal |
| 3775 | 1890 | Normal |
| 3776 | 1890 | Normal |
| 3777 | 1891 | Normal |
| 3778 | 1891 | Normal |
| 3779 | 1892 | Normal |
| 3780 | 1893 | ️ Boss |
| 3781 | 1894 | Post-Boss |
| 3782 | 1894 | Normal (Protected) |
| 3783 | 1894 | Normal |
| 3784 | 1894 | Normal |
| 3785 | 1895 | Normal |
| 3786 | 1895 | Normal |
| 3787 | 1896 | Normal |
| 3788 | 1896 | Normal |
| 3789 | 1897 | Normal |
| 3790 | 1898 | ️ Boss |
| 3791 | 1899 | Post-Boss |
| 3792 | 1899 | Normal (Protected) |
| 3793 | 1899 | Normal |
| 3794 | 1899 | Normal |
| 3795 | 1900 | Normal |
| 3796 | 1900 | Normal |
| 3797 | 1901 | Normal |
| 3798 | 1901 | Normal |
| 3799 | 1902 | Normal |
| 3800 | 1903 | ️ Boss |
| 3801 | 1904 | Post-Boss |
| 3802 | 1904 | Normal (Protected) |
| 3803 | 1904 | Normal |
| 3804 | 1904 | Normal |
| 3805 | 1905 | Normal |
| 3806 | 1905 | Normal |
| 3807 | 1906 | Normal |
| 3808 | 1906 | Normal |
| 3809 | 1907 | Normal |
| 3810 | 1908 | ️ Boss |
| 3811 | 1909 | Post-Boss |
| 3812 | 1909 | Normal (Protected) |
| 3813 | 1909 | Normal |
| 3814 | 1909 | Normal |
| 3815 | 1910 | Normal |
| 3816 | 1910 | Normal |
| 3817 | 1911 | Normal |
| 3818 | 1911 | Normal |
| 3819 | 1912 | Normal |
| 3820 | 1913 | ️ Boss |
| 3821 | 1914 | Post-Boss |
| 3822 | 1914 | Normal (Protected) |
| 3823 | 1914 | Normal |
| 3824 | 1914 | Normal |
| 3825 | 1915 | Normal |
| 3826 | 1915 | Normal |
| 3827 | 1916 | Normal |
| 3828 | 1916 | Normal |
| 3829 | 1917 | Normal |
| 3830 | 1918 | ️ Boss |
| 3831 | 1919 | Post-Boss |
| 3832 | 1919 | Normal (Protected) |
| 3833 | 1919 | Normal |
| 3834 | 1919 | Normal |
| 3835 | 1920 | Normal |
| 3836 | 1920 | Normal |
| 3837 | 1921 | Normal |
| 3838 | 1921 | Normal |
| 3839 | 1922 | Normal |
| 3840 | 1923 | ️ Boss |
| 3841 | 1924 | Post-Boss |
| 3842 | 1924 | Normal (Protected) |
| 3843 | 1924 | Normal |
| 3844 | 1924 | Normal |
| 3845 | 1925 | Normal |
| 3846 | 1925 | Normal |
| 3847 | 1926 | Normal |
| 3848 | 1926 | Normal |
| 3849 | 1927 | Normal |
| 3850 | 1928 | ️ Boss |
| 3851 | 1929 | Post-Boss |
| 3852 | 1929 | Normal (Protected) |
| 3853 | 1929 | Normal |
| 3854 | 1929 | Normal |
| 3855 | 1930 | Normal |
| 3856 | 1930 | Normal |
| 3857 | 1931 | Normal |
| 3858 | 1931 | Normal |
| 3859 | 1932 | Normal |
| 3860 | 1933 | ️ Boss |
| 3861 | 1934 | Post-Boss |
| 3862 | 1934 | Normal (Protected) |
| 3863 | 1934 | Normal |
| 3864 | 1934 | Normal |
| 3865 | 1935 | Normal |
| 3866 | 1935 | Normal |
| 3867 | 1936 | Normal |
| 3868 | 1936 | Normal |
| 3869 | 1937 | Normal |
| 3870 | 1938 | ️ Boss |
| 3871 | 1939 | Post-Boss |
| 3872 | 1939 | Normal (Protected) |
| 3873 | 1939 | Normal |
| 3874 | 1939 | Normal |
| 3875 | 1940 | Normal |
| 3876 | 1940 | Normal |
| 3877 | 1941 | Normal |
| 3878 | 1941 | Normal |
| 3879 | 1942 | Normal |
| 3880 | 1943 | ️ Boss |
| 3881 | 1944 | Post-Boss |
| 3882 | 1944 | Normal (Protected) |
| 3883 | 1944 | Normal |
| 3884 | 1944 | Normal |
| 3885 | 1945 | Normal |
| 3886 | 1945 | Normal |
| 3887 | 1946 | Normal |
| 3888 | 1946 | Normal |
| 3889 | 1947 | Normal |
| 3890 | 1948 | ️ Boss |
| 3891 | 1949 | Post-Boss |
| 3892 | 1949 | Normal (Protected) |
| 3893 | 1949 | Normal |
| 3894 | 1949 | Normal |
| 3895 | 1950 | Normal |
| 3896 | 1950 | Normal |
| 3897 | 1951 | Normal |
| 3898 | 1951 | Normal |
| 3899 | 1952 | Normal |
| 3900 | 1953 | ️ Boss |
| 3901 | 1954 | Post-Boss |
| 3902 | 1954 | Normal (Protected) |
| 3903 | 1954 | Normal |
| 3904 | 1954 | Normal |
| 3905 | 1955 | Normal |
| 3906 | 1955 | Normal |
| 3907 | 1956 | Normal |
| 3908 | 1956 | Normal |
| 3909 | 1957 | Normal |
| 3910 | 1958 | ️ Boss |
| 3911 | 1959 | Post-Boss |
| 3912 | 1959 | Normal (Protected) |
| 3913 | 1959 | Normal |
| 3914 | 1959 | Normal |
| 3915 | 1960 | Normal |
| 3916 | 1960 | Normal |
| 3917 | 1961 | Normal |
| 3918 | 1961 | Normal |
| 3919 | 1962 | Normal |
| 3920 | 1963 | ️ Boss |
| 3921 | 1964 | Post-Boss |
| 3922 | 1964 | Normal (Protected) |
| 3923 | 1964 | Normal |
| 3924 | 1964 | Normal |
| 3925 | 1965 | Normal |
| 3926 | 1965 | Normal |
| 3927 | 1966 | Normal |
| 3928 | 1966 | Normal |
| 3929 | 1967 | Normal |
| 3930 | 1968 | ️ Boss |
| 3931 | 1969 | Post-Boss |
| 3932 | 1969 | Normal (Protected) |
| 3933 | 1969 | Normal |
| 3934 | 1969 | Normal |
| 3935 | 1970 | Normal |
| 3936 | 1970 | Normal |
| 3937 | 1971 | Normal |
| 3938 | 1971 | Normal |
| 3939 | 1972 | Normal |
| 3940 | 1973 | ️ Boss |
| 3941 | 1974 | Post-Boss |
| 3942 | 1974 | Normal (Protected) |
| 3943 | 1974 | Normal |
| 3944 | 1974 | Normal |
| 3945 | 1975 | Normal |
| 3946 | 1975 | Normal |
| 3947 | 1976 | Normal |
| 3948 | 1976 | Normal |
| 3949 | 1977 | Normal |
| 3950 | 1978 | ️ Boss |
| 3951 | 1979 | Post-Boss |
| 3952 | 1979 | Normal (Protected) |
| 3953 | 1979 | Normal |
| 3954 | 1979 | Normal |
| 3955 | 1980 | Normal |
| 3956 | 1980 | Normal |
| 3957 | 1981 | Normal |
| 3958 | 1981 | Normal |
| 3959 | 1982 | Normal |
| 3960 | 1983 | ️ Boss |
| 3961 | 1984 | Post-Boss |
| 3962 | 1984 | Normal (Protected) |
| 3963 | 1984 | Normal |
| 3964 | 1984 | Normal |
| 3965 | 1985 | Normal |
| 3966 | 1985 | Normal |
| 3967 | 1986 | Normal |
| 3968 | 1986 | Normal |
| 3969 | 1987 | Normal |
| 3970 | 1988 | ️ Boss |
| 3971 | 1989 | Post-Boss |
| 3972 | 1989 | Normal (Protected) |
| 3973 | 1989 | Normal |
| 3974 | 1989 | Normal |
| 3975 | 1990 | Normal |
| 3976 | 1990 | Normal |
| 3977 | 1991 | Normal |
| 3978 | 1991 | Normal |
| 3979 | 1992 | Normal |
| 3980 | 1993 | ️ Boss |
| 3981 | 1994 | Post-Boss |
| 3982 | 1994 | Normal (Protected) |
| 3983 | 1994 | Normal |
| 3984 | 1994 | Normal |
| 3985 | 1995 | Normal |
| 3986 | 1995 | Normal |
| 3987 | 1996 | Normal |
| 3988 | 1996 | Normal |
| 3989 | 1997 | Normal |
| 3990 | 1998 | ️ Boss |
| 3991 | 1999 | Post-Boss |
| 3992 | 1999 | Normal (Protected) |
| 3993 | 1999 | Normal |
| 3994 | 1999 | Normal |
| 3995 | 2000 | Normal |
| 3996 | 2000 | Normal |
| 3997 | 2001 | Normal |
| 3998 | 2001 | Normal |
| 3999 | 2002 | Normal |
| 4000 | 2003 | ️ Boss |
