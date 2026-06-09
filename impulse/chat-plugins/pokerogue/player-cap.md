# Player Pokémon Level Cap (Floors 1–4000)

Formula from `getLevelScaling`:
- **Cap** = boss level of the current interval + 1
- **Boss level** = `floor((bossFloor - 2) / 2) + 4` where `bossFloor` is the next multiple of 10
- Cap is **shared** across all floors in the same 10-floor interval (including the boss floor itself)

| Floor | Cap | Type |
|------:|----:|------|
| 1 | 9 | Normal |
| 2 | 9 | Normal |
| 3 | 9 | Normal |
| 4 | 9 | Normal |
| 5 | 9 | Normal |
| 6 | 9 | Normal |
| 7 | 9 | Normal |
| 8 | 9 | Normal |
| 9 | 9 | Normal |
| 10 | 9 | ️ Boss |
| 11 | 14 | Post-Boss |
| 12 | 14 | Normal (Protected) |
| 13 | 14 | Normal |
| 14 | 14 | Normal |
| 15 | 14 | Normal |
| 16 | 14 | Normal |
| 17 | 14 | Normal |
| 18 | 14 | Normal |
| 19 | 14 | Normal |
| 20 | 14 | ️ Boss |
| 21 | 19 | Post-Boss |
| 22 | 19 | Normal (Protected) |
| 23 | 19 | Normal |
| 24 | 19 | Normal |
| 25 | 19 | Normal |
| 26 | 19 | Normal |
| 27 | 19 | Normal |
| 28 | 19 | Normal |
| 29 | 19 | Normal |
| 30 | 19 | ️ Boss |
| 31 | 24 | Post-Boss |
| 32 | 24 | Normal (Protected) |
| 33 | 24 | Normal |
| 34 | 24 | Normal |
| 35 | 24 | Normal |
| 36 | 24 | Normal |
| 37 | 24 | Normal |
| 38 | 24 | Normal |
| 39 | 24 | Normal |
| 40 | 24 | ️ Boss |
| 41 | 29 | Post-Boss |
| 42 | 29 | Normal (Protected) |
| 43 | 29 | Normal |
| 44 | 29 | Normal |
| 45 | 29 | Normal |
| 46 | 29 | Normal |
| 47 | 29 | Normal |
| 48 | 29 | Normal |
| 49 | 29 | Normal |
| 50 | 29 | ️ Boss |
| 51 | 34 | Post-Boss |
| 52 | 34 | Normal (Protected) |
| 53 | 34 | Normal |
| 54 | 34 | Normal |
| 55 | 34 | Normal |
| 56 | 34 | Normal |
| 57 | 34 | Normal |
| 58 | 34 | Normal |
| 59 | 34 | Normal |
| 60 | 34 | ️ Boss |
| 61 | 39 | Post-Boss |
| 62 | 39 | Normal (Protected) |
| 63 | 39 | Normal |
| 64 | 39 | Normal |
| 65 | 39 | Normal |
| 66 | 39 | Normal |
| 67 | 39 | Normal |
| 68 | 39 | Normal |
| 69 | 39 | Normal |
| 70 | 39 | ️ Boss |
| 71 | 44 | Post-Boss |
| 72 | 44 | Normal (Protected) |
| 73 | 44 | Normal |
| 74 | 44 | Normal |
| 75 | 44 | Normal |
| 76 | 44 | Normal |
| 77 | 44 | Normal |
| 78 | 44 | Normal |
| 79 | 44 | Normal |
| 80 | 44 | ️ Boss |
| 81 | 49 | Post-Boss |
| 82 | 49 | Normal (Protected) |
| 83 | 49 | Normal |
| 84 | 49 | Normal |
| 85 | 49 | Normal |
| 86 | 49 | Normal |
| 87 | 49 | Normal |
| 88 | 49 | Normal |
| 89 | 49 | Normal |
| 90 | 49 | ️ Boss |
| 91 | 54 | Post-Boss |
| 92 | 54 | Normal (Protected) |
| 93 | 54 | Normal |
| 94 | 54 | Normal |
| 95 | 54 | Normal |
| 96 | 54 | Normal |
| 97 | 54 | Normal |
| 98 | 54 | Normal |
| 99 | 54 | Normal |
| 100 | 54 | ️ Boss |
| 101 | 59 | Post-Boss |
| 102 | 59 | Normal (Protected) |
| 103 | 59 | Normal |
| 104 | 59 | Normal |
| 105 | 59 | Normal |
| 106 | 59 | Normal |
| 107 | 59 | Normal |
| 108 | 59 | Normal |
| 109 | 59 | Normal |
| 110 | 59 | ️ Boss |
| 111 | 64 | Post-Boss |
| 112 | 64 | Normal (Protected) |
| 113 | 64 | Normal |
| 114 | 64 | Normal |
| 115 | 64 | Normal |
| 116 | 64 | Normal |
| 117 | 64 | Normal |
| 118 | 64 | Normal |
| 119 | 64 | Normal |
| 120 | 64 | ️ Boss |
| 121 | 69 | Post-Boss |
| 122 | 69 | Normal (Protected) |
| 123 | 69 | Normal |
| 124 | 69 | Normal |
| 125 | 69 | Normal |
| 126 | 69 | Normal |
| 127 | 69 | Normal |
| 128 | 69 | Normal |
| 129 | 69 | Normal |
| 130 | 69 | ️ Boss |
| 131 | 74 | Post-Boss |
| 132 | 74 | Normal (Protected) |
| 133 | 74 | Normal |
| 134 | 74 | Normal |
| 135 | 74 | Normal |
| 136 | 74 | Normal |
| 137 | 74 | Normal |
| 138 | 74 | Normal |
| 139 | 74 | Normal |
| 140 | 74 | ️ Boss |
| 141 | 79 | Post-Boss |
| 142 | 79 | Normal (Protected) |
| 143 | 79 | Normal |
| 144 | 79 | Normal |
| 145 | 79 | Normal |
| 146 | 79 | Normal |
| 147 | 79 | Normal |
| 148 | 79 | Normal |
| 149 | 79 | Normal |
| 150 | 79 | ️ Boss |
| 151 | 84 | Post-Boss |
| 152 | 84 | Normal (Protected) |
| 153 | 84 | Normal |
| 154 | 84 | Normal |
| 155 | 84 | Normal |
| 156 | 84 | Normal |
| 157 | 84 | Normal |
| 158 | 84 | Normal |
| 159 | 84 | Normal |
| 160 | 84 | ️ Boss |
| 161 | 89 | Post-Boss |
| 162 | 89 | Normal (Protected) |
| 163 | 89 | Normal |
| 164 | 89 | Normal |
| 165 | 89 | Normal |
| 166 | 89 | Normal |
| 167 | 89 | Normal |
| 168 | 89 | Normal |
| 169 | 89 | Normal |
| 170 | 89 | ️ Boss |
| 171 | 94 | Post-Boss |
| 172 | 94 | Normal (Protected) |
| 173 | 94 | Normal |
| 174 | 94 | Normal |
| 175 | 94 | Normal |
| 176 | 94 | Normal |
| 177 | 94 | Normal |
| 178 | 94 | Normal |
| 179 | 94 | Normal |
| 180 | 94 | ️ Boss |
| 181 | 99 | Post-Boss |
| 182 | 99 | Normal (Protected) |
| 183 | 99 | Normal |
| 184 | 99 | Normal |
| 185 | 99 | Normal |
| 186 | 99 | Normal |
| 187 | 99 | Normal |
| 188 | 99 | Normal |
| 189 | 99 | Normal |
| 190 | 99 | ️ Boss |
| 191 | 104 | Post-Boss |
| 192 | 104 | Normal (Protected) |
| 193 | 104 | Normal |
| 194 | 104 | Normal |
| 195 | 104 | Normal |
| 196 | 104 | Normal |
| 197 | 104 | Normal |
| 198 | 104 | Normal |
| 199 | 104 | Normal |
| 200 | 104 | ️ Boss |
| 201 | 109 | Post-Boss |
| 202 | 109 | Normal (Protected) |
| 203 | 109 | Normal |
| 204 | 109 | Normal |
| 205 | 109 | Normal |
| 206 | 109 | Normal |
| 207 | 109 | Normal |
| 208 | 109 | Normal |
| 209 | 109 | Normal |
| 210 | 109 | ️ Boss |
| 211 | 114 | Post-Boss |
| 212 | 114 | Normal (Protected) |
| 213 | 114 | Normal |
| 214 | 114 | Normal |
| 215 | 114 | Normal |
| 216 | 114 | Normal |
| 217 | 114 | Normal |
| 218 | 114 | Normal |
| 219 | 114 | Normal |
| 220 | 114 | ️ Boss |
| 221 | 119 | Post-Boss |
| 222 | 119 | Normal (Protected) |
| 223 | 119 | Normal |
| 224 | 119 | Normal |
| 225 | 119 | Normal |
| 226 | 119 | Normal |
| 227 | 119 | Normal |
| 228 | 119 | Normal |
| 229 | 119 | Normal |
| 230 | 119 | ️ Boss |
| 231 | 124 | Post-Boss |
| 232 | 124 | Normal (Protected) |
| 233 | 124 | Normal |
| 234 | 124 | Normal |
| 235 | 124 | Normal |
| 236 | 124 | Normal |
| 237 | 124 | Normal |
| 238 | 124 | Normal |
| 239 | 124 | Normal |
| 240 | 124 | ️ Boss |
| 241 | 129 | Post-Boss |
| 242 | 129 | Normal (Protected) |
| 243 | 129 | Normal |
| 244 | 129 | Normal |
| 245 | 129 | Normal |
| 246 | 129 | Normal |
| 247 | 129 | Normal |
| 248 | 129 | Normal |
| 249 | 129 | Normal |
| 250 | 129 | ️ Boss |
| 251 | 134 | Post-Boss |
| 252 | 134 | Normal (Protected) |
| 253 | 134 | Normal |
| 254 | 134 | Normal |
| 255 | 134 | Normal |
| 256 | 134 | Normal |
| 257 | 134 | Normal |
| 258 | 134 | Normal |
| 259 | 134 | Normal |
| 260 | 134 | ️ Boss |
| 261 | 139 | Post-Boss |
| 262 | 139 | Normal (Protected) |
| 263 | 139 | Normal |
| 264 | 139 | Normal |
| 265 | 139 | Normal |
| 266 | 139 | Normal |
| 267 | 139 | Normal |
| 268 | 139 | Normal |
| 269 | 139 | Normal |
| 270 | 139 | ️ Boss |
| 271 | 144 | Post-Boss |
| 272 | 144 | Normal (Protected) |
| 273 | 144 | Normal |
| 274 | 144 | Normal |
| 275 | 144 | Normal |
| 276 | 144 | Normal |
| 277 | 144 | Normal |
| 278 | 144 | Normal |
| 279 | 144 | Normal |
| 280 | 144 | ️ Boss |
| 281 | 149 | Post-Boss |
| 282 | 149 | Normal (Protected) |
| 283 | 149 | Normal |
| 284 | 149 | Normal |
| 285 | 149 | Normal |
| 286 | 149 | Normal |
| 287 | 149 | Normal |
| 288 | 149 | Normal |
| 289 | 149 | Normal |
| 290 | 149 | ️ Boss |
| 291 | 154 | Post-Boss |
| 292 | 154 | Normal (Protected) |
| 293 | 154 | Normal |
| 294 | 154 | Normal |
| 295 | 154 | Normal |
| 296 | 154 | Normal |
| 297 | 154 | Normal |
| 298 | 154 | Normal |
| 299 | 154 | Normal |
| 300 | 154 | ️ Boss |
| 301 | 159 | Post-Boss |
| 302 | 159 | Normal (Protected) |
| 303 | 159 | Normal |
| 304 | 159 | Normal |
| 305 | 159 | Normal |
| 306 | 159 | Normal |
| 307 | 159 | Normal |
| 308 | 159 | Normal |
| 309 | 159 | Normal |
| 310 | 159 | ️ Boss |
| 311 | 164 | Post-Boss |
| 312 | 164 | Normal (Protected) |
| 313 | 164 | Normal |
| 314 | 164 | Normal |
| 315 | 164 | Normal |
| 316 | 164 | Normal |
| 317 | 164 | Normal |
| 318 | 164 | Normal |
| 319 | 164 | Normal |
| 320 | 164 | ️ Boss |
| 321 | 169 | Post-Boss |
| 322 | 169 | Normal (Protected) |
| 323 | 169 | Normal |
| 324 | 169 | Normal |
| 325 | 169 | Normal |
| 326 | 169 | Normal |
| 327 | 169 | Normal |
| 328 | 169 | Normal |
| 329 | 169 | Normal |
| 330 | 169 | ️ Boss |
| 331 | 174 | Post-Boss |
| 332 | 174 | Normal (Protected) |
| 333 | 174 | Normal |
| 334 | 174 | Normal |
| 335 | 174 | Normal |
| 336 | 174 | Normal |
| 337 | 174 | Normal |
| 338 | 174 | Normal |
| 339 | 174 | Normal |
| 340 | 174 | ️ Boss |
| 341 | 179 | Post-Boss |
| 342 | 179 | Normal (Protected) |
| 343 | 179 | Normal |
| 344 | 179 | Normal |
| 345 | 179 | Normal |
| 346 | 179 | Normal |
| 347 | 179 | Normal |
| 348 | 179 | Normal |
| 349 | 179 | Normal |
| 350 | 179 | ️ Boss |
| 351 | 184 | Post-Boss |
| 352 | 184 | Normal (Protected) |
| 353 | 184 | Normal |
| 354 | 184 | Normal |
| 355 | 184 | Normal |
| 356 | 184 | Normal |
| 357 | 184 | Normal |
| 358 | 184 | Normal |
| 359 | 184 | Normal |
| 360 | 184 | ️ Boss |
| 361 | 189 | Post-Boss |
| 362 | 189 | Normal (Protected) |
| 363 | 189 | Normal |
| 364 | 189 | Normal |
| 365 | 189 | Normal |
| 366 | 189 | Normal |
| 367 | 189 | Normal |
| 368 | 189 | Normal |
| 369 | 189 | Normal |
| 370 | 189 | ️ Boss |
| 371 | 194 | Post-Boss |
| 372 | 194 | Normal (Protected) |
| 373 | 194 | Normal |
| 374 | 194 | Normal |
| 375 | 194 | Normal |
| 376 | 194 | Normal |
| 377 | 194 | Normal |
| 378 | 194 | Normal |
| 379 | 194 | Normal |
| 380 | 194 | ️ Boss |
| 381 | 199 | Post-Boss |
| 382 | 199 | Normal (Protected) |
| 383 | 199 | Normal |
| 384 | 199 | Normal |
| 385 | 199 | Normal |
| 386 | 199 | Normal |
| 387 | 199 | Normal |
| 388 | 199 | Normal |
| 389 | 199 | Normal |
| 390 | 199 | ️ Boss |
| 391 | 204 | Post-Boss |
| 392 | 204 | Normal (Protected) |
| 393 | 204 | Normal |
| 394 | 204 | Normal |
| 395 | 204 | Normal |
| 396 | 204 | Normal |
| 397 | 204 | Normal |
| 398 | 204 | Normal |
| 399 | 204 | Normal |
| 400 | 204 | ️ Boss |
| 401 | 209 | Post-Boss |
| 402 | 209 | Normal (Protected) |
| 403 | 209 | Normal |
| 404 | 209 | Normal |
| 405 | 209 | Normal |
| 406 | 209 | Normal |
| 407 | 209 | Normal |
| 408 | 209 | Normal |
| 409 | 209 | Normal |
| 410 | 209 | ️ Boss |
| 411 | 214 | Post-Boss |
| 412 | 214 | Normal (Protected) |
| 413 | 214 | Normal |
| 414 | 214 | Normal |
| 415 | 214 | Normal |
| 416 | 214 | Normal |
| 417 | 214 | Normal |
| 418 | 214 | Normal |
| 419 | 214 | Normal |
| 420 | 214 | ️ Boss |
| 421 | 219 | Post-Boss |
| 422 | 219 | Normal (Protected) |
| 423 | 219 | Normal |
| 424 | 219 | Normal |
| 425 | 219 | Normal |
| 426 | 219 | Normal |
| 427 | 219 | Normal |
| 428 | 219 | Normal |
| 429 | 219 | Normal |
| 430 | 219 | ️ Boss |
| 431 | 224 | Post-Boss |
| 432 | 224 | Normal (Protected) |
| 433 | 224 | Normal |
| 434 | 224 | Normal |
| 435 | 224 | Normal |
| 436 | 224 | Normal |
| 437 | 224 | Normal |
| 438 | 224 | Normal |
| 439 | 224 | Normal |
| 440 | 224 | ️ Boss |
| 441 | 229 | Post-Boss |
| 442 | 229 | Normal (Protected) |
| 443 | 229 | Normal |
| 444 | 229 | Normal |
| 445 | 229 | Normal |
| 446 | 229 | Normal |
| 447 | 229 | Normal |
| 448 | 229 | Normal |
| 449 | 229 | Normal |
| 450 | 229 | ️ Boss |
| 451 | 234 | Post-Boss |
| 452 | 234 | Normal (Protected) |
| 453 | 234 | Normal |
| 454 | 234 | Normal |
| 455 | 234 | Normal |
| 456 | 234 | Normal |
| 457 | 234 | Normal |
| 458 | 234 | Normal |
| 459 | 234 | Normal |
| 460 | 234 | ️ Boss |
| 461 | 239 | Post-Boss |
| 462 | 239 | Normal (Protected) |
| 463 | 239 | Normal |
| 464 | 239 | Normal |
| 465 | 239 | Normal |
| 466 | 239 | Normal |
| 467 | 239 | Normal |
| 468 | 239 | Normal |
| 469 | 239 | Normal |
| 470 | 239 | ️ Boss |
| 471 | 244 | Post-Boss |
| 472 | 244 | Normal (Protected) |
| 473 | 244 | Normal |
| 474 | 244 | Normal |
| 475 | 244 | Normal |
| 476 | 244 | Normal |
| 477 | 244 | Normal |
| 478 | 244 | Normal |
| 479 | 244 | Normal |
| 480 | 244 | ️ Boss |
| 481 | 249 | Post-Boss |
| 482 | 249 | Normal (Protected) |
| 483 | 249 | Normal |
| 484 | 249 | Normal |
| 485 | 249 | Normal |
| 486 | 249 | Normal |
| 487 | 249 | Normal |
| 488 | 249 | Normal |
| 489 | 249 | Normal |
| 490 | 249 | ️ Boss |
| 491 | 254 | Post-Boss |
| 492 | 254 | Normal (Protected) |
| 493 | 254 | Normal |
| 494 | 254 | Normal |
| 495 | 254 | Normal |
| 496 | 254 | Normal |
| 497 | 254 | Normal |
| 498 | 254 | Normal |
| 499 | 254 | Normal |
| 500 | 254 | ️ Boss |
| 501 | 259 | Post-Boss |
| 502 | 259 | Normal (Protected) |
| 503 | 259 | Normal |
| 504 | 259 | Normal |
| 505 | 259 | Normal |
| 506 | 259 | Normal |
| 507 | 259 | Normal |
| 508 | 259 | Normal |
| 509 | 259 | Normal |
| 510 | 259 | ️ Boss |
| 511 | 264 | Post-Boss |
| 512 | 264 | Normal (Protected) |
| 513 | 264 | Normal |
| 514 | 264 | Normal |
| 515 | 264 | Normal |
| 516 | 264 | Normal |
| 517 | 264 | Normal |
| 518 | 264 | Normal |
| 519 | 264 | Normal |
| 520 | 264 | ️ Boss |
| 521 | 269 | Post-Boss |
| 522 | 269 | Normal (Protected) |
| 523 | 269 | Normal |
| 524 | 269 | Normal |
| 525 | 269 | Normal |
| 526 | 269 | Normal |
| 527 | 269 | Normal |
| 528 | 269 | Normal |
| 529 | 269 | Normal |
| 530 | 269 | ️ Boss |
| 531 | 274 | Post-Boss |
| 532 | 274 | Normal (Protected) |
| 533 | 274 | Normal |
| 534 | 274 | Normal |
| 535 | 274 | Normal |
| 536 | 274 | Normal |
| 537 | 274 | Normal |
| 538 | 274 | Normal |
| 539 | 274 | Normal |
| 540 | 274 | ️ Boss |
| 541 | 279 | Post-Boss |
| 542 | 279 | Normal (Protected) |
| 543 | 279 | Normal |
| 544 | 279 | Normal |
| 545 | 279 | Normal |
| 546 | 279 | Normal |
| 547 | 279 | Normal |
| 548 | 279 | Normal |
| 549 | 279 | Normal |
| 550 | 279 | ️ Boss |
| 551 | 284 | Post-Boss |
| 552 | 284 | Normal (Protected) |
| 553 | 284 | Normal |
| 554 | 284 | Normal |
| 555 | 284 | Normal |
| 556 | 284 | Normal |
| 557 | 284 | Normal |
| 558 | 284 | Normal |
| 559 | 284 | Normal |
| 560 | 284 | ️ Boss |
| 561 | 289 | Post-Boss |
| 562 | 289 | Normal (Protected) |
| 563 | 289 | Normal |
| 564 | 289 | Normal |
| 565 | 289 | Normal |
| 566 | 289 | Normal |
| 567 | 289 | Normal |
| 568 | 289 | Normal |
| 569 | 289 | Normal |
| 570 | 289 | ️ Boss |
| 571 | 294 | Post-Boss |
| 572 | 294 | Normal (Protected) |
| 573 | 294 | Normal |
| 574 | 294 | Normal |
| 575 | 294 | Normal |
| 576 | 294 | Normal |
| 577 | 294 | Normal |
| 578 | 294 | Normal |
| 579 | 294 | Normal |
| 580 | 294 | ️ Boss |
| 581 | 299 | Post-Boss |
| 582 | 299 | Normal (Protected) |
| 583 | 299 | Normal |
| 584 | 299 | Normal |
| 585 | 299 | Normal |
| 586 | 299 | Normal |
| 587 | 299 | Normal |
| 588 | 299 | Normal |
| 589 | 299 | Normal |
| 590 | 299 | ️ Boss |
| 591 | 304 | Post-Boss |
| 592 | 304 | Normal (Protected) |
| 593 | 304 | Normal |
| 594 | 304 | Normal |
| 595 | 304 | Normal |
| 596 | 304 | Normal |
| 597 | 304 | Normal |
| 598 | 304 | Normal |
| 599 | 304 | Normal |
| 600 | 304 | ️ Boss |
| 601 | 309 | Post-Boss |
| 602 | 309 | Normal (Protected) |
| 603 | 309 | Normal |
| 604 | 309 | Normal |
| 605 | 309 | Normal |
| 606 | 309 | Normal |
| 607 | 309 | Normal |
| 608 | 309 | Normal |
| 609 | 309 | Normal |
| 610 | 309 | ️ Boss |
| 611 | 314 | Post-Boss |
| 612 | 314 | Normal (Protected) |
| 613 | 314 | Normal |
| 614 | 314 | Normal |
| 615 | 314 | Normal |
| 616 | 314 | Normal |
| 617 | 314 | Normal |
| 618 | 314 | Normal |
| 619 | 314 | Normal |
| 620 | 314 | ️ Boss |
| 621 | 319 | Post-Boss |
| 622 | 319 | Normal (Protected) |
| 623 | 319 | Normal |
| 624 | 319 | Normal |
| 625 | 319 | Normal |
| 626 | 319 | Normal |
| 627 | 319 | Normal |
| 628 | 319 | Normal |
| 629 | 319 | Normal |
| 630 | 319 | ️ Boss |
| 631 | 324 | Post-Boss |
| 632 | 324 | Normal (Protected) |
| 633 | 324 | Normal |
| 634 | 324 | Normal |
| 635 | 324 | Normal |
| 636 | 324 | Normal |
| 637 | 324 | Normal |
| 638 | 324 | Normal |
| 639 | 324 | Normal |
| 640 | 324 | ️ Boss |
| 641 | 329 | Post-Boss |
| 642 | 329 | Normal (Protected) |
| 643 | 329 | Normal |
| 644 | 329 | Normal |
| 645 | 329 | Normal |
| 646 | 329 | Normal |
| 647 | 329 | Normal |
| 648 | 329 | Normal |
| 649 | 329 | Normal |
| 650 | 329 | ️ Boss |
| 651 | 334 | Post-Boss |
| 652 | 334 | Normal (Protected) |
| 653 | 334 | Normal |
| 654 | 334 | Normal |
| 655 | 334 | Normal |
| 656 | 334 | Normal |
| 657 | 334 | Normal |
| 658 | 334 | Normal |
| 659 | 334 | Normal |
| 660 | 334 | ️ Boss |
| 661 | 339 | Post-Boss |
| 662 | 339 | Normal (Protected) |
| 663 | 339 | Normal |
| 664 | 339 | Normal |
| 665 | 339 | Normal |
| 666 | 339 | Normal |
| 667 | 339 | Normal |
| 668 | 339 | Normal |
| 669 | 339 | Normal |
| 670 | 339 | ️ Boss |
| 671 | 344 | Post-Boss |
| 672 | 344 | Normal (Protected) |
| 673 | 344 | Normal |
| 674 | 344 | Normal |
| 675 | 344 | Normal |
| 676 | 344 | Normal |
| 677 | 344 | Normal |
| 678 | 344 | Normal |
| 679 | 344 | Normal |
| 680 | 344 | ️ Boss |
| 681 | 349 | Post-Boss |
| 682 | 349 | Normal (Protected) |
| 683 | 349 | Normal |
| 684 | 349 | Normal |
| 685 | 349 | Normal |
| 686 | 349 | Normal |
| 687 | 349 | Normal |
| 688 | 349 | Normal |
| 689 | 349 | Normal |
| 690 | 349 | ️ Boss |
| 691 | 354 | Post-Boss |
| 692 | 354 | Normal (Protected) |
| 693 | 354 | Normal |
| 694 | 354 | Normal |
| 695 | 354 | Normal |
| 696 | 354 | Normal |
| 697 | 354 | Normal |
| 698 | 354 | Normal |
| 699 | 354 | Normal |
| 700 | 354 | ️ Boss |
| 701 | 359 | Post-Boss |
| 702 | 359 | Normal (Protected) |
| 703 | 359 | Normal |
| 704 | 359 | Normal |
| 705 | 359 | Normal |
| 706 | 359 | Normal |
| 707 | 359 | Normal |
| 708 | 359 | Normal |
| 709 | 359 | Normal |
| 710 | 359 | ️ Boss |
| 711 | 364 | Post-Boss |
| 712 | 364 | Normal (Protected) |
| 713 | 364 | Normal |
| 714 | 364 | Normal |
| 715 | 364 | Normal |
| 716 | 364 | Normal |
| 717 | 364 | Normal |
| 718 | 364 | Normal |
| 719 | 364 | Normal |
| 720 | 364 | ️ Boss |
| 721 | 369 | Post-Boss |
| 722 | 369 | Normal (Protected) |
| 723 | 369 | Normal |
| 724 | 369 | Normal |
| 725 | 369 | Normal |
| 726 | 369 | Normal |
| 727 | 369 | Normal |
| 728 | 369 | Normal |
| 729 | 369 | Normal |
| 730 | 369 | ️ Boss |
| 731 | 374 | Post-Boss |
| 732 | 374 | Normal (Protected) |
| 733 | 374 | Normal |
| 734 | 374 | Normal |
| 735 | 374 | Normal |
| 736 | 374 | Normal |
| 737 | 374 | Normal |
| 738 | 374 | Normal |
| 739 | 374 | Normal |
| 740 | 374 | ️ Boss |
| 741 | 379 | Post-Boss |
| 742 | 379 | Normal (Protected) |
| 743 | 379 | Normal |
| 744 | 379 | Normal |
| 745 | 379 | Normal |
| 746 | 379 | Normal |
| 747 | 379 | Normal |
| 748 | 379 | Normal |
| 749 | 379 | Normal |
| 750 | 379 | ️ Boss |
| 751 | 384 | Post-Boss |
| 752 | 384 | Normal (Protected) |
| 753 | 384 | Normal |
| 754 | 384 | Normal |
| 755 | 384 | Normal |
| 756 | 384 | Normal |
| 757 | 384 | Normal |
| 758 | 384 | Normal |
| 759 | 384 | Normal |
| 760 | 384 | ️ Boss |
| 761 | 389 | Post-Boss |
| 762 | 389 | Normal (Protected) |
| 763 | 389 | Normal |
| 764 | 389 | Normal |
| 765 | 389 | Normal |
| 766 | 389 | Normal |
| 767 | 389 | Normal |
| 768 | 389 | Normal |
| 769 | 389 | Normal |
| 770 | 389 | ️ Boss |
| 771 | 394 | Post-Boss |
| 772 | 394 | Normal (Protected) |
| 773 | 394 | Normal |
| 774 | 394 | Normal |
| 775 | 394 | Normal |
| 776 | 394 | Normal |
| 777 | 394 | Normal |
| 778 | 394 | Normal |
| 779 | 394 | Normal |
| 780 | 394 | ️ Boss |
| 781 | 399 | Post-Boss |
| 782 | 399 | Normal (Protected) |
| 783 | 399 | Normal |
| 784 | 399 | Normal |
| 785 | 399 | Normal |
| 786 | 399 | Normal |
| 787 | 399 | Normal |
| 788 | 399 | Normal |
| 789 | 399 | Normal |
| 790 | 399 | ️ Boss |
| 791 | 404 | Post-Boss |
| 792 | 404 | Normal (Protected) |
| 793 | 404 | Normal |
| 794 | 404 | Normal |
| 795 | 404 | Normal |
| 796 | 404 | Normal |
| 797 | 404 | Normal |
| 798 | 404 | Normal |
| 799 | 404 | Normal |
| 800 | 404 | ️ Boss |
| 801 | 409 | Post-Boss |
| 802 | 409 | Normal (Protected) |
| 803 | 409 | Normal |
| 804 | 409 | Normal |
| 805 | 409 | Normal |
| 806 | 409 | Normal |
| 807 | 409 | Normal |
| 808 | 409 | Normal |
| 809 | 409 | Normal |
| 810 | 409 | ️ Boss |
| 811 | 414 | Post-Boss |
| 812 | 414 | Normal (Protected) |
| 813 | 414 | Normal |
| 814 | 414 | Normal |
| 815 | 414 | Normal |
| 816 | 414 | Normal |
| 817 | 414 | Normal |
| 818 | 414 | Normal |
| 819 | 414 | Normal |
| 820 | 414 | ️ Boss |
| 821 | 419 | Post-Boss |
| 822 | 419 | Normal (Protected) |
| 823 | 419 | Normal |
| 824 | 419 | Normal |
| 825 | 419 | Normal |
| 826 | 419 | Normal |
| 827 | 419 | Normal |
| 828 | 419 | Normal |
| 829 | 419 | Normal |
| 830 | 419 | ️ Boss |
| 831 | 424 | Post-Boss |
| 832 | 424 | Normal (Protected) |
| 833 | 424 | Normal |
| 834 | 424 | Normal |
| 835 | 424 | Normal |
| 836 | 424 | Normal |
| 837 | 424 | Normal |
| 838 | 424 | Normal |
| 839 | 424 | Normal |
| 840 | 424 | ️ Boss |
| 841 | 429 | Post-Boss |
| 842 | 429 | Normal (Protected) |
| 843 | 429 | Normal |
| 844 | 429 | Normal |
| 845 | 429 | Normal |
| 846 | 429 | Normal |
| 847 | 429 | Normal |
| 848 | 429 | Normal |
| 849 | 429 | Normal |
| 850 | 429 | ️ Boss |
| 851 | 434 | Post-Boss |
| 852 | 434 | Normal (Protected) |
| 853 | 434 | Normal |
| 854 | 434 | Normal |
| 855 | 434 | Normal |
| 856 | 434 | Normal |
| 857 | 434 | Normal |
| 858 | 434 | Normal |
| 859 | 434 | Normal |
| 860 | 434 | ️ Boss |
| 861 | 439 | Post-Boss |
| 862 | 439 | Normal (Protected) |
| 863 | 439 | Normal |
| 864 | 439 | Normal |
| 865 | 439 | Normal |
| 866 | 439 | Normal |
| 867 | 439 | Normal |
| 868 | 439 | Normal |
| 869 | 439 | Normal |
| 870 | 439 | ️ Boss |
| 871 | 444 | Post-Boss |
| 872 | 444 | Normal (Protected) |
| 873 | 444 | Normal |
| 874 | 444 | Normal |
| 875 | 444 | Normal |
| 876 | 444 | Normal |
| 877 | 444 | Normal |
| 878 | 444 | Normal |
| 879 | 444 | Normal |
| 880 | 444 | ️ Boss |
| 881 | 449 | Post-Boss |
| 882 | 449 | Normal (Protected) |
| 883 | 449 | Normal |
| 884 | 449 | Normal |
| 885 | 449 | Normal |
| 886 | 449 | Normal |
| 887 | 449 | Normal |
| 888 | 449 | Normal |
| 889 | 449 | Normal |
| 890 | 449 | ️ Boss |
| 891 | 454 | Post-Boss |
| 892 | 454 | Normal (Protected) |
| 893 | 454 | Normal |
| 894 | 454 | Normal |
| 895 | 454 | Normal |
| 896 | 454 | Normal |
| 897 | 454 | Normal |
| 898 | 454 | Normal |
| 899 | 454 | Normal |
| 900 | 454 | ️ Boss |
| 901 | 459 | Post-Boss |
| 902 | 459 | Normal (Protected) |
| 903 | 459 | Normal |
| 904 | 459 | Normal |
| 905 | 459 | Normal |
| 906 | 459 | Normal |
| 907 | 459 | Normal |
| 908 | 459 | Normal |
| 909 | 459 | Normal |
| 910 | 459 | ️ Boss |
| 911 | 464 | Post-Boss |
| 912 | 464 | Normal (Protected) |
| 913 | 464 | Normal |
| 914 | 464 | Normal |
| 915 | 464 | Normal |
| 916 | 464 | Normal |
| 917 | 464 | Normal |
| 918 | 464 | Normal |
| 919 | 464 | Normal |
| 920 | 464 | ️ Boss |
| 921 | 469 | Post-Boss |
| 922 | 469 | Normal (Protected) |
| 923 | 469 | Normal |
| 924 | 469 | Normal |
| 925 | 469 | Normal |
| 926 | 469 | Normal |
| 927 | 469 | Normal |
| 928 | 469 | Normal |
| 929 | 469 | Normal |
| 930 | 469 | ️ Boss |
| 931 | 474 | Post-Boss |
| 932 | 474 | Normal (Protected) |
| 933 | 474 | Normal |
| 934 | 474 | Normal |
| 935 | 474 | Normal |
| 936 | 474 | Normal |
| 937 | 474 | Normal |
| 938 | 474 | Normal |
| 939 | 474 | Normal |
| 940 | 474 | ️ Boss |
| 941 | 479 | Post-Boss |
| 942 | 479 | Normal (Protected) |
| 943 | 479 | Normal |
| 944 | 479 | Normal |
| 945 | 479 | Normal |
| 946 | 479 | Normal |
| 947 | 479 | Normal |
| 948 | 479 | Normal |
| 949 | 479 | Normal |
| 950 | 479 | ️ Boss |
| 951 | 484 | Post-Boss |
| 952 | 484 | Normal (Protected) |
| 953 | 484 | Normal |
| 954 | 484 | Normal |
| 955 | 484 | Normal |
| 956 | 484 | Normal |
| 957 | 484 | Normal |
| 958 | 484 | Normal |
| 959 | 484 | Normal |
| 960 | 484 | ️ Boss |
| 961 | 489 | Post-Boss |
| 962 | 489 | Normal (Protected) |
| 963 | 489 | Normal |
| 964 | 489 | Normal |
| 965 | 489 | Normal |
| 966 | 489 | Normal |
| 967 | 489 | Normal |
| 968 | 489 | Normal |
| 969 | 489 | Normal |
| 970 | 489 | ️ Boss |
| 971 | 494 | Post-Boss |
| 972 | 494 | Normal (Protected) |
| 973 | 494 | Normal |
| 974 | 494 | Normal |
| 975 | 494 | Normal |
| 976 | 494 | Normal |
| 977 | 494 | Normal |
| 978 | 494 | Normal |
| 979 | 494 | Normal |
| 980 | 494 | ️ Boss |
| 981 | 499 | Post-Boss |
| 982 | 499 | Normal (Protected) |
| 983 | 499 | Normal |
| 984 | 499 | Normal |
| 985 | 499 | Normal |
| 986 | 499 | Normal |
| 987 | 499 | Normal |
| 988 | 499 | Normal |
| 989 | 499 | Normal |
| 990 | 499 | ️ Boss |
| 991 | 504 | Post-Boss |
| 992 | 504 | Normal (Protected) |
| 993 | 504 | Normal |
| 994 | 504 | Normal |
| 995 | 504 | Normal |
| 996 | 504 | Normal |
| 997 | 504 | Normal |
| 998 | 504 | Normal |
| 999 | 504 | Normal |
| 1000 | 504 | ️ Boss |
| 1001 | 509 | Post-Boss |
| 1002 | 509 | Normal (Protected) |
| 1003 | 509 | Normal |
| 1004 | 509 | Normal |
| 1005 | 509 | Normal |
| 1006 | 509 | Normal |
| 1007 | 509 | Normal |
| 1008 | 509 | Normal |
| 1009 | 509 | Normal |
| 1010 | 509 | ️ Boss |
| 1011 | 514 | Post-Boss |
| 1012 | 514 | Normal (Protected) |
| 1013 | 514 | Normal |
| 1014 | 514 | Normal |
| 1015 | 514 | Normal |
| 1016 | 514 | Normal |
| 1017 | 514 | Normal |
| 1018 | 514 | Normal |
| 1019 | 514 | Normal |
| 1020 | 514 | ️ Boss |
| 1021 | 519 | Post-Boss |
| 1022 | 519 | Normal (Protected) |
| 1023 | 519 | Normal |
| 1024 | 519 | Normal |
| 1025 | 519 | Normal |
| 1026 | 519 | Normal |
| 1027 | 519 | Normal |
| 1028 | 519 | Normal |
| 1029 | 519 | Normal |
| 1030 | 519 | ️ Boss |
| 1031 | 524 | Post-Boss |
| 1032 | 524 | Normal (Protected) |
| 1033 | 524 | Normal |
| 1034 | 524 | Normal |
| 1035 | 524 | Normal |
| 1036 | 524 | Normal |
| 1037 | 524 | Normal |
| 1038 | 524 | Normal |
| 1039 | 524 | Normal |
| 1040 | 524 | ️ Boss |
| 1041 | 529 | Post-Boss |
| 1042 | 529 | Normal (Protected) |
| 1043 | 529 | Normal |
| 1044 | 529 | Normal |
| 1045 | 529 | Normal |
| 1046 | 529 | Normal |
| 1047 | 529 | Normal |
| 1048 | 529 | Normal |
| 1049 | 529 | Normal |
| 1050 | 529 | ️ Boss |
| 1051 | 534 | Post-Boss |
| 1052 | 534 | Normal (Protected) |
| 1053 | 534 | Normal |
| 1054 | 534 | Normal |
| 1055 | 534 | Normal |
| 1056 | 534 | Normal |
| 1057 | 534 | Normal |
| 1058 | 534 | Normal |
| 1059 | 534 | Normal |
| 1060 | 534 | ️ Boss |
| 1061 | 539 | Post-Boss |
| 1062 | 539 | Normal (Protected) |
| 1063 | 539 | Normal |
| 1064 | 539 | Normal |
| 1065 | 539 | Normal |
| 1066 | 539 | Normal |
| 1067 | 539 | Normal |
| 1068 | 539 | Normal |
| 1069 | 539 | Normal |
| 1070 | 539 | ️ Boss |
| 1071 | 544 | Post-Boss |
| 1072 | 544 | Normal (Protected) |
| 1073 | 544 | Normal |
| 1074 | 544 | Normal |
| 1075 | 544 | Normal |
| 1076 | 544 | Normal |
| 1077 | 544 | Normal |
| 1078 | 544 | Normal |
| 1079 | 544 | Normal |
| 1080 | 544 | ️ Boss |
| 1081 | 549 | Post-Boss |
| 1082 | 549 | Normal (Protected) |
| 1083 | 549 | Normal |
| 1084 | 549 | Normal |
| 1085 | 549 | Normal |
| 1086 | 549 | Normal |
| 1087 | 549 | Normal |
| 1088 | 549 | Normal |
| 1089 | 549 | Normal |
| 1090 | 549 | ️ Boss |
| 1091 | 554 | Post-Boss |
| 1092 | 554 | Normal (Protected) |
| 1093 | 554 | Normal |
| 1094 | 554 | Normal |
| 1095 | 554 | Normal |
| 1096 | 554 | Normal |
| 1097 | 554 | Normal |
| 1098 | 554 | Normal |
| 1099 | 554 | Normal |
| 1100 | 554 | ️ Boss |
| 1101 | 559 | Post-Boss |
| 1102 | 559 | Normal (Protected) |
| 1103 | 559 | Normal |
| 1104 | 559 | Normal |
| 1105 | 559 | Normal |
| 1106 | 559 | Normal |
| 1107 | 559 | Normal |
| 1108 | 559 | Normal |
| 1109 | 559 | Normal |
| 1110 | 559 | ️ Boss |
| 1111 | 564 | Post-Boss |
| 1112 | 564 | Normal (Protected) |
| 1113 | 564 | Normal |
| 1114 | 564 | Normal |
| 1115 | 564 | Normal |
| 1116 | 564 | Normal |
| 1117 | 564 | Normal |
| 1118 | 564 | Normal |
| 1119 | 564 | Normal |
| 1120 | 564 | ️ Boss |
| 1121 | 569 | Post-Boss |
| 1122 | 569 | Normal (Protected) |
| 1123 | 569 | Normal |
| 1124 | 569 | Normal |
| 1125 | 569 | Normal |
| 1126 | 569 | Normal |
| 1127 | 569 | Normal |
| 1128 | 569 | Normal |
| 1129 | 569 | Normal |
| 1130 | 569 | ️ Boss |
| 1131 | 574 | Post-Boss |
| 1132 | 574 | Normal (Protected) |
| 1133 | 574 | Normal |
| 1134 | 574 | Normal |
| 1135 | 574 | Normal |
| 1136 | 574 | Normal |
| 1137 | 574 | Normal |
| 1138 | 574 | Normal |
| 1139 | 574 | Normal |
| 1140 | 574 | ️ Boss |
| 1141 | 579 | Post-Boss |
| 1142 | 579 | Normal (Protected) |
| 1143 | 579 | Normal |
| 1144 | 579 | Normal |
| 1145 | 579 | Normal |
| 1146 | 579 | Normal |
| 1147 | 579 | Normal |
| 1148 | 579 | Normal |
| 1149 | 579 | Normal |
| 1150 | 579 | ️ Boss |
| 1151 | 584 | Post-Boss |
| 1152 | 584 | Normal (Protected) |
| 1153 | 584 | Normal |
| 1154 | 584 | Normal |
| 1155 | 584 | Normal |
| 1156 | 584 | Normal |
| 1157 | 584 | Normal |
| 1158 | 584 | Normal |
| 1159 | 584 | Normal |
| 1160 | 584 | ️ Boss |
| 1161 | 589 | Post-Boss |
| 1162 | 589 | Normal (Protected) |
| 1163 | 589 | Normal |
| 1164 | 589 | Normal |
| 1165 | 589 | Normal |
| 1166 | 589 | Normal |
| 1167 | 589 | Normal |
| 1168 | 589 | Normal |
| 1169 | 589 | Normal |
| 1170 | 589 | ️ Boss |
| 1171 | 594 | Post-Boss |
| 1172 | 594 | Normal (Protected) |
| 1173 | 594 | Normal |
| 1174 | 594 | Normal |
| 1175 | 594 | Normal |
| 1176 | 594 | Normal |
| 1177 | 594 | Normal |
| 1178 | 594 | Normal |
| 1179 | 594 | Normal |
| 1180 | 594 | ️ Boss |
| 1181 | 599 | Post-Boss |
| 1182 | 599 | Normal (Protected) |
| 1183 | 599 | Normal |
| 1184 | 599 | Normal |
| 1185 | 599 | Normal |
| 1186 | 599 | Normal |
| 1187 | 599 | Normal |
| 1188 | 599 | Normal |
| 1189 | 599 | Normal |
| 1190 | 599 | ️ Boss |
| 1191 | 604 | Post-Boss |
| 1192 | 604 | Normal (Protected) |
| 1193 | 604 | Normal |
| 1194 | 604 | Normal |
| 1195 | 604 | Normal |
| 1196 | 604 | Normal |
| 1197 | 604 | Normal |
| 1198 | 604 | Normal |
| 1199 | 604 | Normal |
| 1200 | 604 | ️ Boss |
| 1201 | 609 | Post-Boss |
| 1202 | 609 | Normal (Protected) |
| 1203 | 609 | Normal |
| 1204 | 609 | Normal |
| 1205 | 609 | Normal |
| 1206 | 609 | Normal |
| 1207 | 609 | Normal |
| 1208 | 609 | Normal |
| 1209 | 609 | Normal |
| 1210 | 609 | ️ Boss |
| 1211 | 614 | Post-Boss |
| 1212 | 614 | Normal (Protected) |
| 1213 | 614 | Normal |
| 1214 | 614 | Normal |
| 1215 | 614 | Normal |
| 1216 | 614 | Normal |
| 1217 | 614 | Normal |
| 1218 | 614 | Normal |
| 1219 | 614 | Normal |
| 1220 | 614 | ️ Boss |
| 1221 | 619 | Post-Boss |
| 1222 | 619 | Normal (Protected) |
| 1223 | 619 | Normal |
| 1224 | 619 | Normal |
| 1225 | 619 | Normal |
| 1226 | 619 | Normal |
| 1227 | 619 | Normal |
| 1228 | 619 | Normal |
| 1229 | 619 | Normal |
| 1230 | 619 | ️ Boss |
| 1231 | 624 | Post-Boss |
| 1232 | 624 | Normal (Protected) |
| 1233 | 624 | Normal |
| 1234 | 624 | Normal |
| 1235 | 624 | Normal |
| 1236 | 624 | Normal |
| 1237 | 624 | Normal |
| 1238 | 624 | Normal |
| 1239 | 624 | Normal |
| 1240 | 624 | ️ Boss |
| 1241 | 629 | Post-Boss |
| 1242 | 629 | Normal (Protected) |
| 1243 | 629 | Normal |
| 1244 | 629 | Normal |
| 1245 | 629 | Normal |
| 1246 | 629 | Normal |
| 1247 | 629 | Normal |
| 1248 | 629 | Normal |
| 1249 | 629 | Normal |
| 1250 | 629 | ️ Boss |
| 1251 | 634 | Post-Boss |
| 1252 | 634 | Normal (Protected) |
| 1253 | 634 | Normal |
| 1254 | 634 | Normal |
| 1255 | 634 | Normal |
| 1256 | 634 | Normal |
| 1257 | 634 | Normal |
| 1258 | 634 | Normal |
| 1259 | 634 | Normal |
| 1260 | 634 | ️ Boss |
| 1261 | 639 | Post-Boss |
| 1262 | 639 | Normal (Protected) |
| 1263 | 639 | Normal |
| 1264 | 639 | Normal |
| 1265 | 639 | Normal |
| 1266 | 639 | Normal |
| 1267 | 639 | Normal |
| 1268 | 639 | Normal |
| 1269 | 639 | Normal |
| 1270 | 639 | ️ Boss |
| 1271 | 644 | Post-Boss |
| 1272 | 644 | Normal (Protected) |
| 1273 | 644 | Normal |
| 1274 | 644 | Normal |
| 1275 | 644 | Normal |
| 1276 | 644 | Normal |
| 1277 | 644 | Normal |
| 1278 | 644 | Normal |
| 1279 | 644 | Normal |
| 1280 | 644 | ️ Boss |
| 1281 | 649 | Post-Boss |
| 1282 | 649 | Normal (Protected) |
| 1283 | 649 | Normal |
| 1284 | 649 | Normal |
| 1285 | 649 | Normal |
| 1286 | 649 | Normal |
| 1287 | 649 | Normal |
| 1288 | 649 | Normal |
| 1289 | 649 | Normal |
| 1290 | 649 | ️ Boss |
| 1291 | 654 | Post-Boss |
| 1292 | 654 | Normal (Protected) |
| 1293 | 654 | Normal |
| 1294 | 654 | Normal |
| 1295 | 654 | Normal |
| 1296 | 654 | Normal |
| 1297 | 654 | Normal |
| 1298 | 654 | Normal |
| 1299 | 654 | Normal |
| 1300 | 654 | ️ Boss |
| 1301 | 659 | Post-Boss |
| 1302 | 659 | Normal (Protected) |
| 1303 | 659 | Normal |
| 1304 | 659 | Normal |
| 1305 | 659 | Normal |
| 1306 | 659 | Normal |
| 1307 | 659 | Normal |
| 1308 | 659 | Normal |
| 1309 | 659 | Normal |
| 1310 | 659 | ️ Boss |
| 1311 | 664 | Post-Boss |
| 1312 | 664 | Normal (Protected) |
| 1313 | 664 | Normal |
| 1314 | 664 | Normal |
| 1315 | 664 | Normal |
| 1316 | 664 | Normal |
| 1317 | 664 | Normal |
| 1318 | 664 | Normal |
| 1319 | 664 | Normal |
| 1320 | 664 | ️ Boss |
| 1321 | 669 | Post-Boss |
| 1322 | 669 | Normal (Protected) |
| 1323 | 669 | Normal |
| 1324 | 669 | Normal |
| 1325 | 669 | Normal |
| 1326 | 669 | Normal |
| 1327 | 669 | Normal |
| 1328 | 669 | Normal |
| 1329 | 669 | Normal |
| 1330 | 669 | ️ Boss |
| 1331 | 674 | Post-Boss |
| 1332 | 674 | Normal (Protected) |
| 1333 | 674 | Normal |
| 1334 | 674 | Normal |
| 1335 | 674 | Normal |
| 1336 | 674 | Normal |
| 1337 | 674 | Normal |
| 1338 | 674 | Normal |
| 1339 | 674 | Normal |
| 1340 | 674 | ️ Boss |
| 1341 | 679 | Post-Boss |
| 1342 | 679 | Normal (Protected) |
| 1343 | 679 | Normal |
| 1344 | 679 | Normal |
| 1345 | 679 | Normal |
| 1346 | 679 | Normal |
| 1347 | 679 | Normal |
| 1348 | 679 | Normal |
| 1349 | 679 | Normal |
| 1350 | 679 | ️ Boss |
| 1351 | 684 | Post-Boss |
| 1352 | 684 | Normal (Protected) |
| 1353 | 684 | Normal |
| 1354 | 684 | Normal |
| 1355 | 684 | Normal |
| 1356 | 684 | Normal |
| 1357 | 684 | Normal |
| 1358 | 684 | Normal |
| 1359 | 684 | Normal |
| 1360 | 684 | ️ Boss |
| 1361 | 689 | Post-Boss |
| 1362 | 689 | Normal (Protected) |
| 1363 | 689 | Normal |
| 1364 | 689 | Normal |
| 1365 | 689 | Normal |
| 1366 | 689 | Normal |
| 1367 | 689 | Normal |
| 1368 | 689 | Normal |
| 1369 | 689 | Normal |
| 1370 | 689 | ️ Boss |
| 1371 | 694 | Post-Boss |
| 1372 | 694 | Normal (Protected) |
| 1373 | 694 | Normal |
| 1374 | 694 | Normal |
| 1375 | 694 | Normal |
| 1376 | 694 | Normal |
| 1377 | 694 | Normal |
| 1378 | 694 | Normal |
| 1379 | 694 | Normal |
| 1380 | 694 | ️ Boss |
| 1381 | 699 | Post-Boss |
| 1382 | 699 | Normal (Protected) |
| 1383 | 699 | Normal |
| 1384 | 699 | Normal |
| 1385 | 699 | Normal |
| 1386 | 699 | Normal |
| 1387 | 699 | Normal |
| 1388 | 699 | Normal |
| 1389 | 699 | Normal |
| 1390 | 699 | ️ Boss |
| 1391 | 704 | Post-Boss |
| 1392 | 704 | Normal (Protected) |
| 1393 | 704 | Normal |
| 1394 | 704 | Normal |
| 1395 | 704 | Normal |
| 1396 | 704 | Normal |
| 1397 | 704 | Normal |
| 1398 | 704 | Normal |
| 1399 | 704 | Normal |
| 1400 | 704 | ️ Boss |
| 1401 | 709 | Post-Boss |
| 1402 | 709 | Normal (Protected) |
| 1403 | 709 | Normal |
| 1404 | 709 | Normal |
| 1405 | 709 | Normal |
| 1406 | 709 | Normal |
| 1407 | 709 | Normal |
| 1408 | 709 | Normal |
| 1409 | 709 | Normal |
| 1410 | 709 | ️ Boss |
| 1411 | 714 | Post-Boss |
| 1412 | 714 | Normal (Protected) |
| 1413 | 714 | Normal |
| 1414 | 714 | Normal |
| 1415 | 714 | Normal |
| 1416 | 714 | Normal |
| 1417 | 714 | Normal |
| 1418 | 714 | Normal |
| 1419 | 714 | Normal |
| 1420 | 714 | ️ Boss |
| 1421 | 719 | Post-Boss |
| 1422 | 719 | Normal (Protected) |
| 1423 | 719 | Normal |
| 1424 | 719 | Normal |
| 1425 | 719 | Normal |
| 1426 | 719 | Normal |
| 1427 | 719 | Normal |
| 1428 | 719 | Normal |
| 1429 | 719 | Normal |
| 1430 | 719 | ️ Boss |
| 1431 | 724 | Post-Boss |
| 1432 | 724 | Normal (Protected) |
| 1433 | 724 | Normal |
| 1434 | 724 | Normal |
| 1435 | 724 | Normal |
| 1436 | 724 | Normal |
| 1437 | 724 | Normal |
| 1438 | 724 | Normal |
| 1439 | 724 | Normal |
| 1440 | 724 | ️ Boss |
| 1441 | 729 | Post-Boss |
| 1442 | 729 | Normal (Protected) |
| 1443 | 729 | Normal |
| 1444 | 729 | Normal |
| 1445 | 729 | Normal |
| 1446 | 729 | Normal |
| 1447 | 729 | Normal |
| 1448 | 729 | Normal |
| 1449 | 729 | Normal |
| 1450 | 729 | ️ Boss |
| 1451 | 734 | Post-Boss |
| 1452 | 734 | Normal (Protected) |
| 1453 | 734 | Normal |
| 1454 | 734 | Normal |
| 1455 | 734 | Normal |
| 1456 | 734 | Normal |
| 1457 | 734 | Normal |
| 1458 | 734 | Normal |
| 1459 | 734 | Normal |
| 1460 | 734 | ️ Boss |
| 1461 | 739 | Post-Boss |
| 1462 | 739 | Normal (Protected) |
| 1463 | 739 | Normal |
| 1464 | 739 | Normal |
| 1465 | 739 | Normal |
| 1466 | 739 | Normal |
| 1467 | 739 | Normal |
| 1468 | 739 | Normal |
| 1469 | 739 | Normal |
| 1470 | 739 | ️ Boss |
| 1471 | 744 | Post-Boss |
| 1472 | 744 | Normal (Protected) |
| 1473 | 744 | Normal |
| 1474 | 744 | Normal |
| 1475 | 744 | Normal |
| 1476 | 744 | Normal |
| 1477 | 744 | Normal |
| 1478 | 744 | Normal |
| 1479 | 744 | Normal |
| 1480 | 744 | ️ Boss |
| 1481 | 749 | Post-Boss |
| 1482 | 749 | Normal (Protected) |
| 1483 | 749 | Normal |
| 1484 | 749 | Normal |
| 1485 | 749 | Normal |
| 1486 | 749 | Normal |
| 1487 | 749 | Normal |
| 1488 | 749 | Normal |
| 1489 | 749 | Normal |
| 1490 | 749 | ️ Boss |
| 1491 | 754 | Post-Boss |
| 1492 | 754 | Normal (Protected) |
| 1493 | 754 | Normal |
| 1494 | 754 | Normal |
| 1495 | 754 | Normal |
| 1496 | 754 | Normal |
| 1497 | 754 | Normal |
| 1498 | 754 | Normal |
| 1499 | 754 | Normal |
| 1500 | 754 | ️ Boss |
| 1501 | 759 | Post-Boss |
| 1502 | 759 | Normal (Protected) |
| 1503 | 759 | Normal |
| 1504 | 759 | Normal |
| 1505 | 759 | Normal |
| 1506 | 759 | Normal |
| 1507 | 759 | Normal |
| 1508 | 759 | Normal |
| 1509 | 759 | Normal |
| 1510 | 759 | ️ Boss |
| 1511 | 764 | Post-Boss |
| 1512 | 764 | Normal (Protected) |
| 1513 | 764 | Normal |
| 1514 | 764 | Normal |
| 1515 | 764 | Normal |
| 1516 | 764 | Normal |
| 1517 | 764 | Normal |
| 1518 | 764 | Normal |
| 1519 | 764 | Normal |
| 1520 | 764 | ️ Boss |
| 1521 | 769 | Post-Boss |
| 1522 | 769 | Normal (Protected) |
| 1523 | 769 | Normal |
| 1524 | 769 | Normal |
| 1525 | 769 | Normal |
| 1526 | 769 | Normal |
| 1527 | 769 | Normal |
| 1528 | 769 | Normal |
| 1529 | 769 | Normal |
| 1530 | 769 | ️ Boss |
| 1531 | 774 | Post-Boss |
| 1532 | 774 | Normal (Protected) |
| 1533 | 774 | Normal |
| 1534 | 774 | Normal |
| 1535 | 774 | Normal |
| 1536 | 774 | Normal |
| 1537 | 774 | Normal |
| 1538 | 774 | Normal |
| 1539 | 774 | Normal |
| 1540 | 774 | ️ Boss |
| 1541 | 779 | Post-Boss |
| 1542 | 779 | Normal (Protected) |
| 1543 | 779 | Normal |
| 1544 | 779 | Normal |
| 1545 | 779 | Normal |
| 1546 | 779 | Normal |
| 1547 | 779 | Normal |
| 1548 | 779 | Normal |
| 1549 | 779 | Normal |
| 1550 | 779 | ️ Boss |
| 1551 | 784 | Post-Boss |
| 1552 | 784 | Normal (Protected) |
| 1553 | 784 | Normal |
| 1554 | 784 | Normal |
| 1555 | 784 | Normal |
| 1556 | 784 | Normal |
| 1557 | 784 | Normal |
| 1558 | 784 | Normal |
| 1559 | 784 | Normal |
| 1560 | 784 | ️ Boss |
| 1561 | 789 | Post-Boss |
| 1562 | 789 | Normal (Protected) |
| 1563 | 789 | Normal |
| 1564 | 789 | Normal |
| 1565 | 789 | Normal |
| 1566 | 789 | Normal |
| 1567 | 789 | Normal |
| 1568 | 789 | Normal |
| 1569 | 789 | Normal |
| 1570 | 789 | ️ Boss |
| 1571 | 794 | Post-Boss |
| 1572 | 794 | Normal (Protected) |
| 1573 | 794 | Normal |
| 1574 | 794 | Normal |
| 1575 | 794 | Normal |
| 1576 | 794 | Normal |
| 1577 | 794 | Normal |
| 1578 | 794 | Normal |
| 1579 | 794 | Normal |
| 1580 | 794 | ️ Boss |
| 1581 | 799 | Post-Boss |
| 1582 | 799 | Normal (Protected) |
| 1583 | 799 | Normal |
| 1584 | 799 | Normal |
| 1585 | 799 | Normal |
| 1586 | 799 | Normal |
| 1587 | 799 | Normal |
| 1588 | 799 | Normal |
| 1589 | 799 | Normal |
| 1590 | 799 | ️ Boss |
| 1591 | 804 | Post-Boss |
| 1592 | 804 | Normal (Protected) |
| 1593 | 804 | Normal |
| 1594 | 804 | Normal |
| 1595 | 804 | Normal |
| 1596 | 804 | Normal |
| 1597 | 804 | Normal |
| 1598 | 804 | Normal |
| 1599 | 804 | Normal |
| 1600 | 804 | ️ Boss |
| 1601 | 809 | Post-Boss |
| 1602 | 809 | Normal (Protected) |
| 1603 | 809 | Normal |
| 1604 | 809 | Normal |
| 1605 | 809 | Normal |
| 1606 | 809 | Normal |
| 1607 | 809 | Normal |
| 1608 | 809 | Normal |
| 1609 | 809 | Normal |
| 1610 | 809 | ️ Boss |
| 1611 | 814 | Post-Boss |
| 1612 | 814 | Normal (Protected) |
| 1613 | 814 | Normal |
| 1614 | 814 | Normal |
| 1615 | 814 | Normal |
| 1616 | 814 | Normal |
| 1617 | 814 | Normal |
| 1618 | 814 | Normal |
| 1619 | 814 | Normal |
| 1620 | 814 | ️ Boss |
| 1621 | 819 | Post-Boss |
| 1622 | 819 | Normal (Protected) |
| 1623 | 819 | Normal |
| 1624 | 819 | Normal |
| 1625 | 819 | Normal |
| 1626 | 819 | Normal |
| 1627 | 819 | Normal |
| 1628 | 819 | Normal |
| 1629 | 819 | Normal |
| 1630 | 819 | ️ Boss |
| 1631 | 824 | Post-Boss |
| 1632 | 824 | Normal (Protected) |
| 1633 | 824 | Normal |
| 1634 | 824 | Normal |
| 1635 | 824 | Normal |
| 1636 | 824 | Normal |
| 1637 | 824 | Normal |
| 1638 | 824 | Normal |
| 1639 | 824 | Normal |
| 1640 | 824 | ️ Boss |
| 1641 | 829 | Post-Boss |
| 1642 | 829 | Normal (Protected) |
| 1643 | 829 | Normal |
| 1644 | 829 | Normal |
| 1645 | 829 | Normal |
| 1646 | 829 | Normal |
| 1647 | 829 | Normal |
| 1648 | 829 | Normal |
| 1649 | 829 | Normal |
| 1650 | 829 | ️ Boss |
| 1651 | 834 | Post-Boss |
| 1652 | 834 | Normal (Protected) |
| 1653 | 834 | Normal |
| 1654 | 834 | Normal |
| 1655 | 834 | Normal |
| 1656 | 834 | Normal |
| 1657 | 834 | Normal |
| 1658 | 834 | Normal |
| 1659 | 834 | Normal |
| 1660 | 834 | ️ Boss |
| 1661 | 839 | Post-Boss |
| 1662 | 839 | Normal (Protected) |
| 1663 | 839 | Normal |
| 1664 | 839 | Normal |
| 1665 | 839 | Normal |
| 1666 | 839 | Normal |
| 1667 | 839 | Normal |
| 1668 | 839 | Normal |
| 1669 | 839 | Normal |
| 1670 | 839 | ️ Boss |
| 1671 | 844 | Post-Boss |
| 1672 | 844 | Normal (Protected) |
| 1673 | 844 | Normal |
| 1674 | 844 | Normal |
| 1675 | 844 | Normal |
| 1676 | 844 | Normal |
| 1677 | 844 | Normal |
| 1678 | 844 | Normal |
| 1679 | 844 | Normal |
| 1680 | 844 | ️ Boss |
| 1681 | 849 | Post-Boss |
| 1682 | 849 | Normal (Protected) |
| 1683 | 849 | Normal |
| 1684 | 849 | Normal |
| 1685 | 849 | Normal |
| 1686 | 849 | Normal |
| 1687 | 849 | Normal |
| 1688 | 849 | Normal |
| 1689 | 849 | Normal |
| 1690 | 849 | ️ Boss |
| 1691 | 854 | Post-Boss |
| 1692 | 854 | Normal (Protected) |
| 1693 | 854 | Normal |
| 1694 | 854 | Normal |
| 1695 | 854 | Normal |
| 1696 | 854 | Normal |
| 1697 | 854 | Normal |
| 1698 | 854 | Normal |
| 1699 | 854 | Normal |
| 1700 | 854 | ️ Boss |
| 1701 | 859 | Post-Boss |
| 1702 | 859 | Normal (Protected) |
| 1703 | 859 | Normal |
| 1704 | 859 | Normal |
| 1705 | 859 | Normal |
| 1706 | 859 | Normal |
| 1707 | 859 | Normal |
| 1708 | 859 | Normal |
| 1709 | 859 | Normal |
| 1710 | 859 | ️ Boss |
| 1711 | 864 | Post-Boss |
| 1712 | 864 | Normal (Protected) |
| 1713 | 864 | Normal |
| 1714 | 864 | Normal |
| 1715 | 864 | Normal |
| 1716 | 864 | Normal |
| 1717 | 864 | Normal |
| 1718 | 864 | Normal |
| 1719 | 864 | Normal |
| 1720 | 864 | ️ Boss |
| 1721 | 869 | Post-Boss |
| 1722 | 869 | Normal (Protected) |
| 1723 | 869 | Normal |
| 1724 | 869 | Normal |
| 1725 | 869 | Normal |
| 1726 | 869 | Normal |
| 1727 | 869 | Normal |
| 1728 | 869 | Normal |
| 1729 | 869 | Normal |
| 1730 | 869 | ️ Boss |
| 1731 | 874 | Post-Boss |
| 1732 | 874 | Normal (Protected) |
| 1733 | 874 | Normal |
| 1734 | 874 | Normal |
| 1735 | 874 | Normal |
| 1736 | 874 | Normal |
| 1737 | 874 | Normal |
| 1738 | 874 | Normal |
| 1739 | 874 | Normal |
| 1740 | 874 | ️ Boss |
| 1741 | 879 | Post-Boss |
| 1742 | 879 | Normal (Protected) |
| 1743 | 879 | Normal |
| 1744 | 879 | Normal |
| 1745 | 879 | Normal |
| 1746 | 879 | Normal |
| 1747 | 879 | Normal |
| 1748 | 879 | Normal |
| 1749 | 879 | Normal |
| 1750 | 879 | ️ Boss |
| 1751 | 884 | Post-Boss |
| 1752 | 884 | Normal (Protected) |
| 1753 | 884 | Normal |
| 1754 | 884 | Normal |
| 1755 | 884 | Normal |
| 1756 | 884 | Normal |
| 1757 | 884 | Normal |
| 1758 | 884 | Normal |
| 1759 | 884 | Normal |
| 1760 | 884 | ️ Boss |
| 1761 | 889 | Post-Boss |
| 1762 | 889 | Normal (Protected) |
| 1763 | 889 | Normal |
| 1764 | 889 | Normal |
| 1765 | 889 | Normal |
| 1766 | 889 | Normal |
| 1767 | 889 | Normal |
| 1768 | 889 | Normal |
| 1769 | 889 | Normal |
| 1770 | 889 | ️ Boss |
| 1771 | 894 | Post-Boss |
| 1772 | 894 | Normal (Protected) |
| 1773 | 894 | Normal |
| 1774 | 894 | Normal |
| 1775 | 894 | Normal |
| 1776 | 894 | Normal |
| 1777 | 894 | Normal |
| 1778 | 894 | Normal |
| 1779 | 894 | Normal |
| 1780 | 894 | ️ Boss |
| 1781 | 899 | Post-Boss |
| 1782 | 899 | Normal (Protected) |
| 1783 | 899 | Normal |
| 1784 | 899 | Normal |
| 1785 | 899 | Normal |
| 1786 | 899 | Normal |
| 1787 | 899 | Normal |
| 1788 | 899 | Normal |
| 1789 | 899 | Normal |
| 1790 | 899 | ️ Boss |
| 1791 | 904 | Post-Boss |
| 1792 | 904 | Normal (Protected) |
| 1793 | 904 | Normal |
| 1794 | 904 | Normal |
| 1795 | 904 | Normal |
| 1796 | 904 | Normal |
| 1797 | 904 | Normal |
| 1798 | 904 | Normal |
| 1799 | 904 | Normal |
| 1800 | 904 | ️ Boss |
| 1801 | 909 | Post-Boss |
| 1802 | 909 | Normal (Protected) |
| 1803 | 909 | Normal |
| 1804 | 909 | Normal |
| 1805 | 909 | Normal |
| 1806 | 909 | Normal |
| 1807 | 909 | Normal |
| 1808 | 909 | Normal |
| 1809 | 909 | Normal |
| 1810 | 909 | ️ Boss |
| 1811 | 914 | Post-Boss |
| 1812 | 914 | Normal (Protected) |
| 1813 | 914 | Normal |
| 1814 | 914 | Normal |
| 1815 | 914 | Normal |
| 1816 | 914 | Normal |
| 1817 | 914 | Normal |
| 1818 | 914 | Normal |
| 1819 | 914 | Normal |
| 1820 | 914 | ️ Boss |
| 1821 | 919 | Post-Boss |
| 1822 | 919 | Normal (Protected) |
| 1823 | 919 | Normal |
| 1824 | 919 | Normal |
| 1825 | 919 | Normal |
| 1826 | 919 | Normal |
| 1827 | 919 | Normal |
| 1828 | 919 | Normal |
| 1829 | 919 | Normal |
| 1830 | 919 | ️ Boss |
| 1831 | 924 | Post-Boss |
| 1832 | 924 | Normal (Protected) |
| 1833 | 924 | Normal |
| 1834 | 924 | Normal |
| 1835 | 924 | Normal |
| 1836 | 924 | Normal |
| 1837 | 924 | Normal |
| 1838 | 924 | Normal |
| 1839 | 924 | Normal |
| 1840 | 924 | ️ Boss |
| 1841 | 929 | Post-Boss |
| 1842 | 929 | Normal (Protected) |
| 1843 | 929 | Normal |
| 1844 | 929 | Normal |
| 1845 | 929 | Normal |
| 1846 | 929 | Normal |
| 1847 | 929 | Normal |
| 1848 | 929 | Normal |
| 1849 | 929 | Normal |
| 1850 | 929 | ️ Boss |
| 1851 | 934 | Post-Boss |
| 1852 | 934 | Normal (Protected) |
| 1853 | 934 | Normal |
| 1854 | 934 | Normal |
| 1855 | 934 | Normal |
| 1856 | 934 | Normal |
| 1857 | 934 | Normal |
| 1858 | 934 | Normal |
| 1859 | 934 | Normal |
| 1860 | 934 | ️ Boss |
| 1861 | 939 | Post-Boss |
| 1862 | 939 | Normal (Protected) |
| 1863 | 939 | Normal |
| 1864 | 939 | Normal |
| 1865 | 939 | Normal |
| 1866 | 939 | Normal |
| 1867 | 939 | Normal |
| 1868 | 939 | Normal |
| 1869 | 939 | Normal |
| 1870 | 939 | ️ Boss |
| 1871 | 944 | Post-Boss |
| 1872 | 944 | Normal (Protected) |
| 1873 | 944 | Normal |
| 1874 | 944 | Normal |
| 1875 | 944 | Normal |
| 1876 | 944 | Normal |
| 1877 | 944 | Normal |
| 1878 | 944 | Normal |
| 1879 | 944 | Normal |
| 1880 | 944 | ️ Boss |
| 1881 | 949 | Post-Boss |
| 1882 | 949 | Normal (Protected) |
| 1883 | 949 | Normal |
| 1884 | 949 | Normal |
| 1885 | 949 | Normal |
| 1886 | 949 | Normal |
| 1887 | 949 | Normal |
| 1888 | 949 | Normal |
| 1889 | 949 | Normal |
| 1890 | 949 | ️ Boss |
| 1891 | 954 | Post-Boss |
| 1892 | 954 | Normal (Protected) |
| 1893 | 954 | Normal |
| 1894 | 954 | Normal |
| 1895 | 954 | Normal |
| 1896 | 954 | Normal |
| 1897 | 954 | Normal |
| 1898 | 954 | Normal |
| 1899 | 954 | Normal |
| 1900 | 954 | ️ Boss |
| 1901 | 959 | Post-Boss |
| 1902 | 959 | Normal (Protected) |
| 1903 | 959 | Normal |
| 1904 | 959 | Normal |
| 1905 | 959 | Normal |
| 1906 | 959 | Normal |
| 1907 | 959 | Normal |
| 1908 | 959 | Normal |
| 1909 | 959 | Normal |
| 1910 | 959 | ️ Boss |
| 1911 | 964 | Post-Boss |
| 1912 | 964 | Normal (Protected) |
| 1913 | 964 | Normal |
| 1914 | 964 | Normal |
| 1915 | 964 | Normal |
| 1916 | 964 | Normal |
| 1917 | 964 | Normal |
| 1918 | 964 | Normal |
| 1919 | 964 | Normal |
| 1920 | 964 | ️ Boss |
| 1921 | 969 | Post-Boss |
| 1922 | 969 | Normal (Protected) |
| 1923 | 969 | Normal |
| 1924 | 969 | Normal |
| 1925 | 969 | Normal |
| 1926 | 969 | Normal |
| 1927 | 969 | Normal |
| 1928 | 969 | Normal |
| 1929 | 969 | Normal |
| 1930 | 969 | ️ Boss |
| 1931 | 974 | Post-Boss |
| 1932 | 974 | Normal (Protected) |
| 1933 | 974 | Normal |
| 1934 | 974 | Normal |
| 1935 | 974 | Normal |
| 1936 | 974 | Normal |
| 1937 | 974 | Normal |
| 1938 | 974 | Normal |
| 1939 | 974 | Normal |
| 1940 | 974 | ️ Boss |
| 1941 | 979 | Post-Boss |
| 1942 | 979 | Normal (Protected) |
| 1943 | 979 | Normal |
| 1944 | 979 | Normal |
| 1945 | 979 | Normal |
| 1946 | 979 | Normal |
| 1947 | 979 | Normal |
| 1948 | 979 | Normal |
| 1949 | 979 | Normal |
| 1950 | 979 | ️ Boss |
| 1951 | 984 | Post-Boss |
| 1952 | 984 | Normal (Protected) |
| 1953 | 984 | Normal |
| 1954 | 984 | Normal |
| 1955 | 984 | Normal |
| 1956 | 984 | Normal |
| 1957 | 984 | Normal |
| 1958 | 984 | Normal |
| 1959 | 984 | Normal |
| 1960 | 984 | ️ Boss |
| 1961 | 989 | Post-Boss |
| 1962 | 989 | Normal (Protected) |
| 1963 | 989 | Normal |
| 1964 | 989 | Normal |
| 1965 | 989 | Normal |
| 1966 | 989 | Normal |
| 1967 | 989 | Normal |
| 1968 | 989 | Normal |
| 1969 | 989 | Normal |
| 1970 | 989 | ️ Boss |
| 1971 | 994 | Post-Boss |
| 1972 | 994 | Normal (Protected) |
| 1973 | 994 | Normal |
| 1974 | 994 | Normal |
| 1975 | 994 | Normal |
| 1976 | 994 | Normal |
| 1977 | 994 | Normal |
| 1978 | 994 | Normal |
| 1979 | 994 | Normal |
| 1980 | 994 | ️ Boss |
| 1981 | 999 | Post-Boss |
| 1982 | 999 | Normal (Protected) |
| 1983 | 999 | Normal |
| 1984 | 999 | Normal |
| 1985 | 999 | Normal |
| 1986 | 999 | Normal |
| 1987 | 999 | Normal |
| 1988 | 999 | Normal |
| 1989 | 999 | Normal |
| 1990 | 999 | ️ Boss |
| 1991 | 1004 | Post-Boss |
| 1992 | 1004 | Normal (Protected) |
| 1993 | 1004 | Normal |
| 1994 | 1004 | Normal |
| 1995 | 1004 | Normal |
| 1996 | 1004 | Normal |
| 1997 | 1004 | Normal |
| 1998 | 1004 | Normal |
| 1999 | 1004 | Normal |
| 2000 | 1004 | ️ Boss |
| 2001 | 1009 | Post-Boss |
| 2002 | 1009 | Normal (Protected) |
| 2003 | 1009 | Normal |
| 2004 | 1009 | Normal |
| 2005 | 1009 | Normal |
| 2006 | 1009 | Normal |
| 2007 | 1009 | Normal |
| 2008 | 1009 | Normal |
| 2009 | 1009 | Normal |
| 2010 | 1009 | ️ Boss |
| 2011 | 1014 | Post-Boss |
| 2012 | 1014 | Normal (Protected) |
| 2013 | 1014 | Normal |
| 2014 | 1014 | Normal |
| 2015 | 1014 | Normal |
| 2016 | 1014 | Normal |
| 2017 | 1014 | Normal |
| 2018 | 1014 | Normal |
| 2019 | 1014 | Normal |
| 2020 | 1014 | ️ Boss |
| 2021 | 1019 | Post-Boss |
| 2022 | 1019 | Normal (Protected) |
| 2023 | 1019 | Normal |
| 2024 | 1019 | Normal |
| 2025 | 1019 | Normal |
| 2026 | 1019 | Normal |
| 2027 | 1019 | Normal |
| 2028 | 1019 | Normal |
| 2029 | 1019 | Normal |
| 2030 | 1019 | ️ Boss |
| 2031 | 1024 | Post-Boss |
| 2032 | 1024 | Normal (Protected) |
| 2033 | 1024 | Normal |
| 2034 | 1024 | Normal |
| 2035 | 1024 | Normal |
| 2036 | 1024 | Normal |
| 2037 | 1024 | Normal |
| 2038 | 1024 | Normal |
| 2039 | 1024 | Normal |
| 2040 | 1024 | ️ Boss |
| 2041 | 1029 | Post-Boss |
| 2042 | 1029 | Normal (Protected) |
| 2043 | 1029 | Normal |
| 2044 | 1029 | Normal |
| 2045 | 1029 | Normal |
| 2046 | 1029 | Normal |
| 2047 | 1029 | Normal |
| 2048 | 1029 | Normal |
| 2049 | 1029 | Normal |
| 2050 | 1029 | ️ Boss |
| 2051 | 1034 | Post-Boss |
| 2052 | 1034 | Normal (Protected) |
| 2053 | 1034 | Normal |
| 2054 | 1034 | Normal |
| 2055 | 1034 | Normal |
| 2056 | 1034 | Normal |
| 2057 | 1034 | Normal |
| 2058 | 1034 | Normal |
| 2059 | 1034 | Normal |
| 2060 | 1034 | ️ Boss |
| 2061 | 1039 | Post-Boss |
| 2062 | 1039 | Normal (Protected) |
| 2063 | 1039 | Normal |
| 2064 | 1039 | Normal |
| 2065 | 1039 | Normal |
| 2066 | 1039 | Normal |
| 2067 | 1039 | Normal |
| 2068 | 1039 | Normal |
| 2069 | 1039 | Normal |
| 2070 | 1039 | ️ Boss |
| 2071 | 1044 | Post-Boss |
| 2072 | 1044 | Normal (Protected) |
| 2073 | 1044 | Normal |
| 2074 | 1044 | Normal |
| 2075 | 1044 | Normal |
| 2076 | 1044 | Normal |
| 2077 | 1044 | Normal |
| 2078 | 1044 | Normal |
| 2079 | 1044 | Normal |
| 2080 | 1044 | ️ Boss |
| 2081 | 1049 | Post-Boss |
| 2082 | 1049 | Normal (Protected) |
| 2083 | 1049 | Normal |
| 2084 | 1049 | Normal |
| 2085 | 1049 | Normal |
| 2086 | 1049 | Normal |
| 2087 | 1049 | Normal |
| 2088 | 1049 | Normal |
| 2089 | 1049 | Normal |
| 2090 | 1049 | ️ Boss |
| 2091 | 1054 | Post-Boss |
| 2092 | 1054 | Normal (Protected) |
| 2093 | 1054 | Normal |
| 2094 | 1054 | Normal |
| 2095 | 1054 | Normal |
| 2096 | 1054 | Normal |
| 2097 | 1054 | Normal |
| 2098 | 1054 | Normal |
| 2099 | 1054 | Normal |
| 2100 | 1054 | ️ Boss |
| 2101 | 1059 | Post-Boss |
| 2102 | 1059 | Normal (Protected) |
| 2103 | 1059 | Normal |
| 2104 | 1059 | Normal |
| 2105 | 1059 | Normal |
| 2106 | 1059 | Normal |
| 2107 | 1059 | Normal |
| 2108 | 1059 | Normal |
| 2109 | 1059 | Normal |
| 2110 | 1059 | ️ Boss |
| 2111 | 1064 | Post-Boss |
| 2112 | 1064 | Normal (Protected) |
| 2113 | 1064 | Normal |
| 2114 | 1064 | Normal |
| 2115 | 1064 | Normal |
| 2116 | 1064 | Normal |
| 2117 | 1064 | Normal |
| 2118 | 1064 | Normal |
| 2119 | 1064 | Normal |
| 2120 | 1064 | ️ Boss |
| 2121 | 1069 | Post-Boss |
| 2122 | 1069 | Normal (Protected) |
| 2123 | 1069 | Normal |
| 2124 | 1069 | Normal |
| 2125 | 1069 | Normal |
| 2126 | 1069 | Normal |
| 2127 | 1069 | Normal |
| 2128 | 1069 | Normal |
| 2129 | 1069 | Normal |
| 2130 | 1069 | ️ Boss |
| 2131 | 1074 | Post-Boss |
| 2132 | 1074 | Normal (Protected) |
| 2133 | 1074 | Normal |
| 2134 | 1074 | Normal |
| 2135 | 1074 | Normal |
| 2136 | 1074 | Normal |
| 2137 | 1074 | Normal |
| 2138 | 1074 | Normal |
| 2139 | 1074 | Normal |
| 2140 | 1074 | ️ Boss |
| 2141 | 1079 | Post-Boss |
| 2142 | 1079 | Normal (Protected) |
| 2143 | 1079 | Normal |
| 2144 | 1079 | Normal |
| 2145 | 1079 | Normal |
| 2146 | 1079 | Normal |
| 2147 | 1079 | Normal |
| 2148 | 1079 | Normal |
| 2149 | 1079 | Normal |
| 2150 | 1079 | ️ Boss |
| 2151 | 1084 | Post-Boss |
| 2152 | 1084 | Normal (Protected) |
| 2153 | 1084 | Normal |
| 2154 | 1084 | Normal |
| 2155 | 1084 | Normal |
| 2156 | 1084 | Normal |
| 2157 | 1084 | Normal |
| 2158 | 1084 | Normal |
| 2159 | 1084 | Normal |
| 2160 | 1084 | ️ Boss |
| 2161 | 1089 | Post-Boss |
| 2162 | 1089 | Normal (Protected) |
| 2163 | 1089 | Normal |
| 2164 | 1089 | Normal |
| 2165 | 1089 | Normal |
| 2166 | 1089 | Normal |
| 2167 | 1089 | Normal |
| 2168 | 1089 | Normal |
| 2169 | 1089 | Normal |
| 2170 | 1089 | ️ Boss |
| 2171 | 1094 | Post-Boss |
| 2172 | 1094 | Normal (Protected) |
| 2173 | 1094 | Normal |
| 2174 | 1094 | Normal |
| 2175 | 1094 | Normal |
| 2176 | 1094 | Normal |
| 2177 | 1094 | Normal |
| 2178 | 1094 | Normal |
| 2179 | 1094 | Normal |
| 2180 | 1094 | ️ Boss |
| 2181 | 1099 | Post-Boss |
| 2182 | 1099 | Normal (Protected) |
| 2183 | 1099 | Normal |
| 2184 | 1099 | Normal |
| 2185 | 1099 | Normal |
| 2186 | 1099 | Normal |
| 2187 | 1099 | Normal |
| 2188 | 1099 | Normal |
| 2189 | 1099 | Normal |
| 2190 | 1099 | ️ Boss |
| 2191 | 1104 | Post-Boss |
| 2192 | 1104 | Normal (Protected) |
| 2193 | 1104 | Normal |
| 2194 | 1104 | Normal |
| 2195 | 1104 | Normal |
| 2196 | 1104 | Normal |
| 2197 | 1104 | Normal |
| 2198 | 1104 | Normal |
| 2199 | 1104 | Normal |
| 2200 | 1104 | ️ Boss |
| 2201 | 1109 | Post-Boss |
| 2202 | 1109 | Normal (Protected) |
| 2203 | 1109 | Normal |
| 2204 | 1109 | Normal |
| 2205 | 1109 | Normal |
| 2206 | 1109 | Normal |
| 2207 | 1109 | Normal |
| 2208 | 1109 | Normal |
| 2209 | 1109 | Normal |
| 2210 | 1109 | ️ Boss |
| 2211 | 1114 | Post-Boss |
| 2212 | 1114 | Normal (Protected) |
| 2213 | 1114 | Normal |
| 2214 | 1114 | Normal |
| 2215 | 1114 | Normal |
| 2216 | 1114 | Normal |
| 2217 | 1114 | Normal |
| 2218 | 1114 | Normal |
| 2219 | 1114 | Normal |
| 2220 | 1114 | ️ Boss |
| 2221 | 1119 | Post-Boss |
| 2222 | 1119 | Normal (Protected) |
| 2223 | 1119 | Normal |
| 2224 | 1119 | Normal |
| 2225 | 1119 | Normal |
| 2226 | 1119 | Normal |
| 2227 | 1119 | Normal |
| 2228 | 1119 | Normal |
| 2229 | 1119 | Normal |
| 2230 | 1119 | ️ Boss |
| 2231 | 1124 | Post-Boss |
| 2232 | 1124 | Normal (Protected) |
| 2233 | 1124 | Normal |
| 2234 | 1124 | Normal |
| 2235 | 1124 | Normal |
| 2236 | 1124 | Normal |
| 2237 | 1124 | Normal |
| 2238 | 1124 | Normal |
| 2239 | 1124 | Normal |
| 2240 | 1124 | ️ Boss |
| 2241 | 1129 | Post-Boss |
| 2242 | 1129 | Normal (Protected) |
| 2243 | 1129 | Normal |
| 2244 | 1129 | Normal |
| 2245 | 1129 | Normal |
| 2246 | 1129 | Normal |
| 2247 | 1129 | Normal |
| 2248 | 1129 | Normal |
| 2249 | 1129 | Normal |
| 2250 | 1129 | ️ Boss |
| 2251 | 1134 | Post-Boss |
| 2252 | 1134 | Normal (Protected) |
| 2253 | 1134 | Normal |
| 2254 | 1134 | Normal |
| 2255 | 1134 | Normal |
| 2256 | 1134 | Normal |
| 2257 | 1134 | Normal |
| 2258 | 1134 | Normal |
| 2259 | 1134 | Normal |
| 2260 | 1134 | ️ Boss |
| 2261 | 1139 | Post-Boss |
| 2262 | 1139 | Normal (Protected) |
| 2263 | 1139 | Normal |
| 2264 | 1139 | Normal |
| 2265 | 1139 | Normal |
| 2266 | 1139 | Normal |
| 2267 | 1139 | Normal |
| 2268 | 1139 | Normal |
| 2269 | 1139 | Normal |
| 2270 | 1139 | ️ Boss |
| 2271 | 1144 | Post-Boss |
| 2272 | 1144 | Normal (Protected) |
| 2273 | 1144 | Normal |
| 2274 | 1144 | Normal |
| 2275 | 1144 | Normal |
| 2276 | 1144 | Normal |
| 2277 | 1144 | Normal |
| 2278 | 1144 | Normal |
| 2279 | 1144 | Normal |
| 2280 | 1144 | ️ Boss |
| 2281 | 1149 | Post-Boss |
| 2282 | 1149 | Normal (Protected) |
| 2283 | 1149 | Normal |
| 2284 | 1149 | Normal |
| 2285 | 1149 | Normal |
| 2286 | 1149 | Normal |
| 2287 | 1149 | Normal |
| 2288 | 1149 | Normal |
| 2289 | 1149 | Normal |
| 2290 | 1149 | ️ Boss |
| 2291 | 1154 | Post-Boss |
| 2292 | 1154 | Normal (Protected) |
| 2293 | 1154 | Normal |
| 2294 | 1154 | Normal |
| 2295 | 1154 | Normal |
| 2296 | 1154 | Normal |
| 2297 | 1154 | Normal |
| 2298 | 1154 | Normal |
| 2299 | 1154 | Normal |
| 2300 | 1154 | ️ Boss |
| 2301 | 1159 | Post-Boss |
| 2302 | 1159 | Normal (Protected) |
| 2303 | 1159 | Normal |
| 2304 | 1159 | Normal |
| 2305 | 1159 | Normal |
| 2306 | 1159 | Normal |
| 2307 | 1159 | Normal |
| 2308 | 1159 | Normal |
| 2309 | 1159 | Normal |
| 2310 | 1159 | ️ Boss |
| 2311 | 1164 | Post-Boss |
| 2312 | 1164 | Normal (Protected) |
| 2313 | 1164 | Normal |
| 2314 | 1164 | Normal |
| 2315 | 1164 | Normal |
| 2316 | 1164 | Normal |
| 2317 | 1164 | Normal |
| 2318 | 1164 | Normal |
| 2319 | 1164 | Normal |
| 2320 | 1164 | ️ Boss |
| 2321 | 1169 | Post-Boss |
| 2322 | 1169 | Normal (Protected) |
| 2323 | 1169 | Normal |
| 2324 | 1169 | Normal |
| 2325 | 1169 | Normal |
| 2326 | 1169 | Normal |
| 2327 | 1169 | Normal |
| 2328 | 1169 | Normal |
| 2329 | 1169 | Normal |
| 2330 | 1169 | ️ Boss |
| 2331 | 1174 | Post-Boss |
| 2332 | 1174 | Normal (Protected) |
| 2333 | 1174 | Normal |
| 2334 | 1174 | Normal |
| 2335 | 1174 | Normal |
| 2336 | 1174 | Normal |
| 2337 | 1174 | Normal |
| 2338 | 1174 | Normal |
| 2339 | 1174 | Normal |
| 2340 | 1174 | ️ Boss |
| 2341 | 1179 | Post-Boss |
| 2342 | 1179 | Normal (Protected) |
| 2343 | 1179 | Normal |
| 2344 | 1179 | Normal |
| 2345 | 1179 | Normal |
| 2346 | 1179 | Normal |
| 2347 | 1179 | Normal |
| 2348 | 1179 | Normal |
| 2349 | 1179 | Normal |
| 2350 | 1179 | ️ Boss |
| 2351 | 1184 | Post-Boss |
| 2352 | 1184 | Normal (Protected) |
| 2353 | 1184 | Normal |
| 2354 | 1184 | Normal |
| 2355 | 1184 | Normal |
| 2356 | 1184 | Normal |
| 2357 | 1184 | Normal |
| 2358 | 1184 | Normal |
| 2359 | 1184 | Normal |
| 2360 | 1184 | ️ Boss |
| 2361 | 1189 | Post-Boss |
| 2362 | 1189 | Normal (Protected) |
| 2363 | 1189 | Normal |
| 2364 | 1189 | Normal |
| 2365 | 1189 | Normal |
| 2366 | 1189 | Normal |
| 2367 | 1189 | Normal |
| 2368 | 1189 | Normal |
| 2369 | 1189 | Normal |
| 2370 | 1189 | ️ Boss |
| 2371 | 1194 | Post-Boss |
| 2372 | 1194 | Normal (Protected) |
| 2373 | 1194 | Normal |
| 2374 | 1194 | Normal |
| 2375 | 1194 | Normal |
| 2376 | 1194 | Normal |
| 2377 | 1194 | Normal |
| 2378 | 1194 | Normal |
| 2379 | 1194 | Normal |
| 2380 | 1194 | ️ Boss |
| 2381 | 1199 | Post-Boss |
| 2382 | 1199 | Normal (Protected) |
| 2383 | 1199 | Normal |
| 2384 | 1199 | Normal |
| 2385 | 1199 | Normal |
| 2386 | 1199 | Normal |
| 2387 | 1199 | Normal |
| 2388 | 1199 | Normal |
| 2389 | 1199 | Normal |
| 2390 | 1199 | ️ Boss |
| 2391 | 1204 | Post-Boss |
| 2392 | 1204 | Normal (Protected) |
| 2393 | 1204 | Normal |
| 2394 | 1204 | Normal |
| 2395 | 1204 | Normal |
| 2396 | 1204 | Normal |
| 2397 | 1204 | Normal |
| 2398 | 1204 | Normal |
| 2399 | 1204 | Normal |
| 2400 | 1204 | ️ Boss |
| 2401 | 1209 | Post-Boss |
| 2402 | 1209 | Normal (Protected) |
| 2403 | 1209 | Normal |
| 2404 | 1209 | Normal |
| 2405 | 1209 | Normal |
| 2406 | 1209 | Normal |
| 2407 | 1209 | Normal |
| 2408 | 1209 | Normal |
| 2409 | 1209 | Normal |
| 2410 | 1209 | ️ Boss |
| 2411 | 1214 | Post-Boss |
| 2412 | 1214 | Normal (Protected) |
| 2413 | 1214 | Normal |
| 2414 | 1214 | Normal |
| 2415 | 1214 | Normal |
| 2416 | 1214 | Normal |
| 2417 | 1214 | Normal |
| 2418 | 1214 | Normal |
| 2419 | 1214 | Normal |
| 2420 | 1214 | ️ Boss |
| 2421 | 1219 | Post-Boss |
| 2422 | 1219 | Normal (Protected) |
| 2423 | 1219 | Normal |
| 2424 | 1219 | Normal |
| 2425 | 1219 | Normal |
| 2426 | 1219 | Normal |
| 2427 | 1219 | Normal |
| 2428 | 1219 | Normal |
| 2429 | 1219 | Normal |
| 2430 | 1219 | ️ Boss |
| 2431 | 1224 | Post-Boss |
| 2432 | 1224 | Normal (Protected) |
| 2433 | 1224 | Normal |
| 2434 | 1224 | Normal |
| 2435 | 1224 | Normal |
| 2436 | 1224 | Normal |
| 2437 | 1224 | Normal |
| 2438 | 1224 | Normal |
| 2439 | 1224 | Normal |
| 2440 | 1224 | ️ Boss |
| 2441 | 1229 | Post-Boss |
| 2442 | 1229 | Normal (Protected) |
| 2443 | 1229 | Normal |
| 2444 | 1229 | Normal |
| 2445 | 1229 | Normal |
| 2446 | 1229 | Normal |
| 2447 | 1229 | Normal |
| 2448 | 1229 | Normal |
| 2449 | 1229 | Normal |
| 2450 | 1229 | ️ Boss |
| 2451 | 1234 | Post-Boss |
| 2452 | 1234 | Normal (Protected) |
| 2453 | 1234 | Normal |
| 2454 | 1234 | Normal |
| 2455 | 1234 | Normal |
| 2456 | 1234 | Normal |
| 2457 | 1234 | Normal |
| 2458 | 1234 | Normal |
| 2459 | 1234 | Normal |
| 2460 | 1234 | ️ Boss |
| 2461 | 1239 | Post-Boss |
| 2462 | 1239 | Normal (Protected) |
| 2463 | 1239 | Normal |
| 2464 | 1239 | Normal |
| 2465 | 1239 | Normal |
| 2466 | 1239 | Normal |
| 2467 | 1239 | Normal |
| 2468 | 1239 | Normal |
| 2469 | 1239 | Normal |
| 2470 | 1239 | ️ Boss |
| 2471 | 1244 | Post-Boss |
| 2472 | 1244 | Normal (Protected) |
| 2473 | 1244 | Normal |
| 2474 | 1244 | Normal |
| 2475 | 1244 | Normal |
| 2476 | 1244 | Normal |
| 2477 | 1244 | Normal |
| 2478 | 1244 | Normal |
| 2479 | 1244 | Normal |
| 2480 | 1244 | ️ Boss |
| 2481 | 1249 | Post-Boss |
| 2482 | 1249 | Normal (Protected) |
| 2483 | 1249 | Normal |
| 2484 | 1249 | Normal |
| 2485 | 1249 | Normal |
| 2486 | 1249 | Normal |
| 2487 | 1249 | Normal |
| 2488 | 1249 | Normal |
| 2489 | 1249 | Normal |
| 2490 | 1249 | ️ Boss |
| 2491 | 1254 | Post-Boss |
| 2492 | 1254 | Normal (Protected) |
| 2493 | 1254 | Normal |
| 2494 | 1254 | Normal |
| 2495 | 1254 | Normal |
| 2496 | 1254 | Normal |
| 2497 | 1254 | Normal |
| 2498 | 1254 | Normal |
| 2499 | 1254 | Normal |
| 2500 | 1254 | ️ Boss |
| 2501 | 1259 | Post-Boss |
| 2502 | 1259 | Normal (Protected) |
| 2503 | 1259 | Normal |
| 2504 | 1259 | Normal |
| 2505 | 1259 | Normal |
| 2506 | 1259 | Normal |
| 2507 | 1259 | Normal |
| 2508 | 1259 | Normal |
| 2509 | 1259 | Normal |
| 2510 | 1259 | ️ Boss |
| 2511 | 1264 | Post-Boss |
| 2512 | 1264 | Normal (Protected) |
| 2513 | 1264 | Normal |
| 2514 | 1264 | Normal |
| 2515 | 1264 | Normal |
| 2516 | 1264 | Normal |
| 2517 | 1264 | Normal |
| 2518 | 1264 | Normal |
| 2519 | 1264 | Normal |
| 2520 | 1264 | ️ Boss |
| 2521 | 1269 | Post-Boss |
| 2522 | 1269 | Normal (Protected) |
| 2523 | 1269 | Normal |
| 2524 | 1269 | Normal |
| 2525 | 1269 | Normal |
| 2526 | 1269 | Normal |
| 2527 | 1269 | Normal |
| 2528 | 1269 | Normal |
| 2529 | 1269 | Normal |
| 2530 | 1269 | ️ Boss |
| 2531 | 1274 | Post-Boss |
| 2532 | 1274 | Normal (Protected) |
| 2533 | 1274 | Normal |
| 2534 | 1274 | Normal |
| 2535 | 1274 | Normal |
| 2536 | 1274 | Normal |
| 2537 | 1274 | Normal |
| 2538 | 1274 | Normal |
| 2539 | 1274 | Normal |
| 2540 | 1274 | ️ Boss |
| 2541 | 1279 | Post-Boss |
| 2542 | 1279 | Normal (Protected) |
| 2543 | 1279 | Normal |
| 2544 | 1279 | Normal |
| 2545 | 1279 | Normal |
| 2546 | 1279 | Normal |
| 2547 | 1279 | Normal |
| 2548 | 1279 | Normal |
| 2549 | 1279 | Normal |
| 2550 | 1279 | ️ Boss |
| 2551 | 1284 | Post-Boss |
| 2552 | 1284 | Normal (Protected) |
| 2553 | 1284 | Normal |
| 2554 | 1284 | Normal |
| 2555 | 1284 | Normal |
| 2556 | 1284 | Normal |
| 2557 | 1284 | Normal |
| 2558 | 1284 | Normal |
| 2559 | 1284 | Normal |
| 2560 | 1284 | ️ Boss |
| 2561 | 1289 | Post-Boss |
| 2562 | 1289 | Normal (Protected) |
| 2563 | 1289 | Normal |
| 2564 | 1289 | Normal |
| 2565 | 1289 | Normal |
| 2566 | 1289 | Normal |
| 2567 | 1289 | Normal |
| 2568 | 1289 | Normal |
| 2569 | 1289 | Normal |
| 2570 | 1289 | ️ Boss |
| 2571 | 1294 | Post-Boss |
| 2572 | 1294 | Normal (Protected) |
| 2573 | 1294 | Normal |
| 2574 | 1294 | Normal |
| 2575 | 1294 | Normal |
| 2576 | 1294 | Normal |
| 2577 | 1294 | Normal |
| 2578 | 1294 | Normal |
| 2579 | 1294 | Normal |
| 2580 | 1294 | ️ Boss |
| 2581 | 1299 | Post-Boss |
| 2582 | 1299 | Normal (Protected) |
| 2583 | 1299 | Normal |
| 2584 | 1299 | Normal |
| 2585 | 1299 | Normal |
| 2586 | 1299 | Normal |
| 2587 | 1299 | Normal |
| 2588 | 1299 | Normal |
| 2589 | 1299 | Normal |
| 2590 | 1299 | ️ Boss |
| 2591 | 1304 | Post-Boss |
| 2592 | 1304 | Normal (Protected) |
| 2593 | 1304 | Normal |
| 2594 | 1304 | Normal |
| 2595 | 1304 | Normal |
| 2596 | 1304 | Normal |
| 2597 | 1304 | Normal |
| 2598 | 1304 | Normal |
| 2599 | 1304 | Normal |
| 2600 | 1304 | ️ Boss |
| 2601 | 1309 | Post-Boss |
| 2602 | 1309 | Normal (Protected) |
| 2603 | 1309 | Normal |
| 2604 | 1309 | Normal |
| 2605 | 1309 | Normal |
| 2606 | 1309 | Normal |
| 2607 | 1309 | Normal |
| 2608 | 1309 | Normal |
| 2609 | 1309 | Normal |
| 2610 | 1309 | ️ Boss |
| 2611 | 1314 | Post-Boss |
| 2612 | 1314 | Normal (Protected) |
| 2613 | 1314 | Normal |
| 2614 | 1314 | Normal |
| 2615 | 1314 | Normal |
| 2616 | 1314 | Normal |
| 2617 | 1314 | Normal |
| 2618 | 1314 | Normal |
| 2619 | 1314 | Normal |
| 2620 | 1314 | ️ Boss |
| 2621 | 1319 | Post-Boss |
| 2622 | 1319 | Normal (Protected) |
| 2623 | 1319 | Normal |
| 2624 | 1319 | Normal |
| 2625 | 1319 | Normal |
| 2626 | 1319 | Normal |
| 2627 | 1319 | Normal |
| 2628 | 1319 | Normal |
| 2629 | 1319 | Normal |
| 2630 | 1319 | ️ Boss |
| 2631 | 1324 | Post-Boss |
| 2632 | 1324 | Normal (Protected) |
| 2633 | 1324 | Normal |
| 2634 | 1324 | Normal |
| 2635 | 1324 | Normal |
| 2636 | 1324 | Normal |
| 2637 | 1324 | Normal |
| 2638 | 1324 | Normal |
| 2639 | 1324 | Normal |
| 2640 | 1324 | ️ Boss |
| 2641 | 1329 | Post-Boss |
| 2642 | 1329 | Normal (Protected) |
| 2643 | 1329 | Normal |
| 2644 | 1329 | Normal |
| 2645 | 1329 | Normal |
| 2646 | 1329 | Normal |
| 2647 | 1329 | Normal |
| 2648 | 1329 | Normal |
| 2649 | 1329 | Normal |
| 2650 | 1329 | ️ Boss |
| 2651 | 1334 | Post-Boss |
| 2652 | 1334 | Normal (Protected) |
| 2653 | 1334 | Normal |
| 2654 | 1334 | Normal |
| 2655 | 1334 | Normal |
| 2656 | 1334 | Normal |
| 2657 | 1334 | Normal |
| 2658 | 1334 | Normal |
| 2659 | 1334 | Normal |
| 2660 | 1334 | ️ Boss |
| 2661 | 1339 | Post-Boss |
| 2662 | 1339 | Normal (Protected) |
| 2663 | 1339 | Normal |
| 2664 | 1339 | Normal |
| 2665 | 1339 | Normal |
| 2666 | 1339 | Normal |
| 2667 | 1339 | Normal |
| 2668 | 1339 | Normal |
| 2669 | 1339 | Normal |
| 2670 | 1339 | ️ Boss |
| 2671 | 1344 | Post-Boss |
| 2672 | 1344 | Normal (Protected) |
| 2673 | 1344 | Normal |
| 2674 | 1344 | Normal |
| 2675 | 1344 | Normal |
| 2676 | 1344 | Normal |
| 2677 | 1344 | Normal |
| 2678 | 1344 | Normal |
| 2679 | 1344 | Normal |
| 2680 | 1344 | ️ Boss |
| 2681 | 1349 | Post-Boss |
| 2682 | 1349 | Normal (Protected) |
| 2683 | 1349 | Normal |
| 2684 | 1349 | Normal |
| 2685 | 1349 | Normal |
| 2686 | 1349 | Normal |
| 2687 | 1349 | Normal |
| 2688 | 1349 | Normal |
| 2689 | 1349 | Normal |
| 2690 | 1349 | ️ Boss |
| 2691 | 1354 | Post-Boss |
| 2692 | 1354 | Normal (Protected) |
| 2693 | 1354 | Normal |
| 2694 | 1354 | Normal |
| 2695 | 1354 | Normal |
| 2696 | 1354 | Normal |
| 2697 | 1354 | Normal |
| 2698 | 1354 | Normal |
| 2699 | 1354 | Normal |
| 2700 | 1354 | ️ Boss |
| 2701 | 1359 | Post-Boss |
| 2702 | 1359 | Normal (Protected) |
| 2703 | 1359 | Normal |
| 2704 | 1359 | Normal |
| 2705 | 1359 | Normal |
| 2706 | 1359 | Normal |
| 2707 | 1359 | Normal |
| 2708 | 1359 | Normal |
| 2709 | 1359 | Normal |
| 2710 | 1359 | ️ Boss |
| 2711 | 1364 | Post-Boss |
| 2712 | 1364 | Normal (Protected) |
| 2713 | 1364 | Normal |
| 2714 | 1364 | Normal |
| 2715 | 1364 | Normal |
| 2716 | 1364 | Normal |
| 2717 | 1364 | Normal |
| 2718 | 1364 | Normal |
| 2719 | 1364 | Normal |
| 2720 | 1364 | ️ Boss |
| 2721 | 1369 | Post-Boss |
| 2722 | 1369 | Normal (Protected) |
| 2723 | 1369 | Normal |
| 2724 | 1369 | Normal |
| 2725 | 1369 | Normal |
| 2726 | 1369 | Normal |
| 2727 | 1369 | Normal |
| 2728 | 1369 | Normal |
| 2729 | 1369 | Normal |
| 2730 | 1369 | ️ Boss |
| 2731 | 1374 | Post-Boss |
| 2732 | 1374 | Normal (Protected) |
| 2733 | 1374 | Normal |
| 2734 | 1374 | Normal |
| 2735 | 1374 | Normal |
| 2736 | 1374 | Normal |
| 2737 | 1374 | Normal |
| 2738 | 1374 | Normal |
| 2739 | 1374 | Normal |
| 2740 | 1374 | ️ Boss |
| 2741 | 1379 | Post-Boss |
| 2742 | 1379 | Normal (Protected) |
| 2743 | 1379 | Normal |
| 2744 | 1379 | Normal |
| 2745 | 1379 | Normal |
| 2746 | 1379 | Normal |
| 2747 | 1379 | Normal |
| 2748 | 1379 | Normal |
| 2749 | 1379 | Normal |
| 2750 | 1379 | ️ Boss |
| 2751 | 1384 | Post-Boss |
| 2752 | 1384 | Normal (Protected) |
| 2753 | 1384 | Normal |
| 2754 | 1384 | Normal |
| 2755 | 1384 | Normal |
| 2756 | 1384 | Normal |
| 2757 | 1384 | Normal |
| 2758 | 1384 | Normal |
| 2759 | 1384 | Normal |
| 2760 | 1384 | ️ Boss |
| 2761 | 1389 | Post-Boss |
| 2762 | 1389 | Normal (Protected) |
| 2763 | 1389 | Normal |
| 2764 | 1389 | Normal |
| 2765 | 1389 | Normal |
| 2766 | 1389 | Normal |
| 2767 | 1389 | Normal |
| 2768 | 1389 | Normal |
| 2769 | 1389 | Normal |
| 2770 | 1389 | ️ Boss |
| 2771 | 1394 | Post-Boss |
| 2772 | 1394 | Normal (Protected) |
| 2773 | 1394 | Normal |
| 2774 | 1394 | Normal |
| 2775 | 1394 | Normal |
| 2776 | 1394 | Normal |
| 2777 | 1394 | Normal |
| 2778 | 1394 | Normal |
| 2779 | 1394 | Normal |
| 2780 | 1394 | ️ Boss |
| 2781 | 1399 | Post-Boss |
| 2782 | 1399 | Normal (Protected) |
| 2783 | 1399 | Normal |
| 2784 | 1399 | Normal |
| 2785 | 1399 | Normal |
| 2786 | 1399 | Normal |
| 2787 | 1399 | Normal |
| 2788 | 1399 | Normal |
| 2789 | 1399 | Normal |
| 2790 | 1399 | ️ Boss |
| 2791 | 1404 | Post-Boss |
| 2792 | 1404 | Normal (Protected) |
| 2793 | 1404 | Normal |
| 2794 | 1404 | Normal |
| 2795 | 1404 | Normal |
| 2796 | 1404 | Normal |
| 2797 | 1404 | Normal |
| 2798 | 1404 | Normal |
| 2799 | 1404 | Normal |
| 2800 | 1404 | ️ Boss |
| 2801 | 1409 | Post-Boss |
| 2802 | 1409 | Normal (Protected) |
| 2803 | 1409 | Normal |
| 2804 | 1409 | Normal |
| 2805 | 1409 | Normal |
| 2806 | 1409 | Normal |
| 2807 | 1409 | Normal |
| 2808 | 1409 | Normal |
| 2809 | 1409 | Normal |
| 2810 | 1409 | ️ Boss |
| 2811 | 1414 | Post-Boss |
| 2812 | 1414 | Normal (Protected) |
| 2813 | 1414 | Normal |
| 2814 | 1414 | Normal |
| 2815 | 1414 | Normal |
| 2816 | 1414 | Normal |
| 2817 | 1414 | Normal |
| 2818 | 1414 | Normal |
| 2819 | 1414 | Normal |
| 2820 | 1414 | ️ Boss |
| 2821 | 1419 | Post-Boss |
| 2822 | 1419 | Normal (Protected) |
| 2823 | 1419 | Normal |
| 2824 | 1419 | Normal |
| 2825 | 1419 | Normal |
| 2826 | 1419 | Normal |
| 2827 | 1419 | Normal |
| 2828 | 1419 | Normal |
| 2829 | 1419 | Normal |
| 2830 | 1419 | ️ Boss |
| 2831 | 1424 | Post-Boss |
| 2832 | 1424 | Normal (Protected) |
| 2833 | 1424 | Normal |
| 2834 | 1424 | Normal |
| 2835 | 1424 | Normal |
| 2836 | 1424 | Normal |
| 2837 | 1424 | Normal |
| 2838 | 1424 | Normal |
| 2839 | 1424 | Normal |
| 2840 | 1424 | ️ Boss |
| 2841 | 1429 | Post-Boss |
| 2842 | 1429 | Normal (Protected) |
| 2843 | 1429 | Normal |
| 2844 | 1429 | Normal |
| 2845 | 1429 | Normal |
| 2846 | 1429 | Normal |
| 2847 | 1429 | Normal |
| 2848 | 1429 | Normal |
| 2849 | 1429 | Normal |
| 2850 | 1429 | ️ Boss |
| 2851 | 1434 | Post-Boss |
| 2852 | 1434 | Normal (Protected) |
| 2853 | 1434 | Normal |
| 2854 | 1434 | Normal |
| 2855 | 1434 | Normal |
| 2856 | 1434 | Normal |
| 2857 | 1434 | Normal |
| 2858 | 1434 | Normal |
| 2859 | 1434 | Normal |
| 2860 | 1434 | ️ Boss |
| 2861 | 1439 | Post-Boss |
| 2862 | 1439 | Normal (Protected) |
| 2863 | 1439 | Normal |
| 2864 | 1439 | Normal |
| 2865 | 1439 | Normal |
| 2866 | 1439 | Normal |
| 2867 | 1439 | Normal |
| 2868 | 1439 | Normal |
| 2869 | 1439 | Normal |
| 2870 | 1439 | ️ Boss |
| 2871 | 1444 | Post-Boss |
| 2872 | 1444 | Normal (Protected) |
| 2873 | 1444 | Normal |
| 2874 | 1444 | Normal |
| 2875 | 1444 | Normal |
| 2876 | 1444 | Normal |
| 2877 | 1444 | Normal |
| 2878 | 1444 | Normal |
| 2879 | 1444 | Normal |
| 2880 | 1444 | ️ Boss |
| 2881 | 1449 | Post-Boss |
| 2882 | 1449 | Normal (Protected) |
| 2883 | 1449 | Normal |
| 2884 | 1449 | Normal |
| 2885 | 1449 | Normal |
| 2886 | 1449 | Normal |
| 2887 | 1449 | Normal |
| 2888 | 1449 | Normal |
| 2889 | 1449 | Normal |
| 2890 | 1449 | ️ Boss |
| 2891 | 1454 | Post-Boss |
| 2892 | 1454 | Normal (Protected) |
| 2893 | 1454 | Normal |
| 2894 | 1454 | Normal |
| 2895 | 1454 | Normal |
| 2896 | 1454 | Normal |
| 2897 | 1454 | Normal |
| 2898 | 1454 | Normal |
| 2899 | 1454 | Normal |
| 2900 | 1454 | ️ Boss |
| 2901 | 1459 | Post-Boss |
| 2902 | 1459 | Normal (Protected) |
| 2903 | 1459 | Normal |
| 2904 | 1459 | Normal |
| 2905 | 1459 | Normal |
| 2906 | 1459 | Normal |
| 2907 | 1459 | Normal |
| 2908 | 1459 | Normal |
| 2909 | 1459 | Normal |
| 2910 | 1459 | ️ Boss |
| 2911 | 1464 | Post-Boss |
| 2912 | 1464 | Normal (Protected) |
| 2913 | 1464 | Normal |
| 2914 | 1464 | Normal |
| 2915 | 1464 | Normal |
| 2916 | 1464 | Normal |
| 2917 | 1464 | Normal |
| 2918 | 1464 | Normal |
| 2919 | 1464 | Normal |
| 2920 | 1464 | ️ Boss |
| 2921 | 1469 | Post-Boss |
| 2922 | 1469 | Normal (Protected) |
| 2923 | 1469 | Normal |
| 2924 | 1469 | Normal |
| 2925 | 1469 | Normal |
| 2926 | 1469 | Normal |
| 2927 | 1469 | Normal |
| 2928 | 1469 | Normal |
| 2929 | 1469 | Normal |
| 2930 | 1469 | ️ Boss |
| 2931 | 1474 | Post-Boss |
| 2932 | 1474 | Normal (Protected) |
| 2933 | 1474 | Normal |
| 2934 | 1474 | Normal |
| 2935 | 1474 | Normal |
| 2936 | 1474 | Normal |
| 2937 | 1474 | Normal |
| 2938 | 1474 | Normal |
| 2939 | 1474 | Normal |
| 2940 | 1474 | ️ Boss |
| 2941 | 1479 | Post-Boss |
| 2942 | 1479 | Normal (Protected) |
| 2943 | 1479 | Normal |
| 2944 | 1479 | Normal |
| 2945 | 1479 | Normal |
| 2946 | 1479 | Normal |
| 2947 | 1479 | Normal |
| 2948 | 1479 | Normal |
| 2949 | 1479 | Normal |
| 2950 | 1479 | ️ Boss |
| 2951 | 1484 | Post-Boss |
| 2952 | 1484 | Normal (Protected) |
| 2953 | 1484 | Normal |
| 2954 | 1484 | Normal |
| 2955 | 1484 | Normal |
| 2956 | 1484 | Normal |
| 2957 | 1484 | Normal |
| 2958 | 1484 | Normal |
| 2959 | 1484 | Normal |
| 2960 | 1484 | ️ Boss |
| 2961 | 1489 | Post-Boss |
| 2962 | 1489 | Normal (Protected) |
| 2963 | 1489 | Normal |
| 2964 | 1489 | Normal |
| 2965 | 1489 | Normal |
| 2966 | 1489 | Normal |
| 2967 | 1489 | Normal |
| 2968 | 1489 | Normal |
| 2969 | 1489 | Normal |
| 2970 | 1489 | ️ Boss |
| 2971 | 1494 | Post-Boss |
| 2972 | 1494 | Normal (Protected) |
| 2973 | 1494 | Normal |
| 2974 | 1494 | Normal |
| 2975 | 1494 | Normal |
| 2976 | 1494 | Normal |
| 2977 | 1494 | Normal |
| 2978 | 1494 | Normal |
| 2979 | 1494 | Normal |
| 2980 | 1494 | ️ Boss |
| 2981 | 1499 | Post-Boss |
| 2982 | 1499 | Normal (Protected) |
| 2983 | 1499 | Normal |
| 2984 | 1499 | Normal |
| 2985 | 1499 | Normal |
| 2986 | 1499 | Normal |
| 2987 | 1499 | Normal |
| 2988 | 1499 | Normal |
| 2989 | 1499 | Normal |
| 2990 | 1499 | ️ Boss |
| 2991 | 1504 | Post-Boss |
| 2992 | 1504 | Normal (Protected) |
| 2993 | 1504 | Normal |
| 2994 | 1504 | Normal |
| 2995 | 1504 | Normal |
| 2996 | 1504 | Normal |
| 2997 | 1504 | Normal |
| 2998 | 1504 | Normal |
| 2999 | 1504 | Normal |
| 3000 | 1504 | ️ Boss |
| 3001 | 1509 | Post-Boss |
| 3002 | 1509 | Normal (Protected) |
| 3003 | 1509 | Normal |
| 3004 | 1509 | Normal |
| 3005 | 1509 | Normal |
| 3006 | 1509 | Normal |
| 3007 | 1509 | Normal |
| 3008 | 1509 | Normal |
| 3009 | 1509 | Normal |
| 3010 | 1509 | ️ Boss |
| 3011 | 1514 | Post-Boss |
| 3012 | 1514 | Normal (Protected) |
| 3013 | 1514 | Normal |
| 3014 | 1514 | Normal |
| 3015 | 1514 | Normal |
| 3016 | 1514 | Normal |
| 3017 | 1514 | Normal |
| 3018 | 1514 | Normal |
| 3019 | 1514 | Normal |
| 3020 | 1514 | ️ Boss |
| 3021 | 1519 | Post-Boss |
| 3022 | 1519 | Normal (Protected) |
| 3023 | 1519 | Normal |
| 3024 | 1519 | Normal |
| 3025 | 1519 | Normal |
| 3026 | 1519 | Normal |
| 3027 | 1519 | Normal |
| 3028 | 1519 | Normal |
| 3029 | 1519 | Normal |
| 3030 | 1519 | ️ Boss |
| 3031 | 1524 | Post-Boss |
| 3032 | 1524 | Normal (Protected) |
| 3033 | 1524 | Normal |
| 3034 | 1524 | Normal |
| 3035 | 1524 | Normal |
| 3036 | 1524 | Normal |
| 3037 | 1524 | Normal |
| 3038 | 1524 | Normal |
| 3039 | 1524 | Normal |
| 3040 | 1524 | ️ Boss |
| 3041 | 1529 | Post-Boss |
| 3042 | 1529 | Normal (Protected) |
| 3043 | 1529 | Normal |
| 3044 | 1529 | Normal |
| 3045 | 1529 | Normal |
| 3046 | 1529 | Normal |
| 3047 | 1529 | Normal |
| 3048 | 1529 | Normal |
| 3049 | 1529 | Normal |
| 3050 | 1529 | ️ Boss |
| 3051 | 1534 | Post-Boss |
| 3052 | 1534 | Normal (Protected) |
| 3053 | 1534 | Normal |
| 3054 | 1534 | Normal |
| 3055 | 1534 | Normal |
| 3056 | 1534 | Normal |
| 3057 | 1534 | Normal |
| 3058 | 1534 | Normal |
| 3059 | 1534 | Normal |
| 3060 | 1534 | ️ Boss |
| 3061 | 1539 | Post-Boss |
| 3062 | 1539 | Normal (Protected) |
| 3063 | 1539 | Normal |
| 3064 | 1539 | Normal |
| 3065 | 1539 | Normal |
| 3066 | 1539 | Normal |
| 3067 | 1539 | Normal |
| 3068 | 1539 | Normal |
| 3069 | 1539 | Normal |
| 3070 | 1539 | ️ Boss |
| 3071 | 1544 | Post-Boss |
| 3072 | 1544 | Normal (Protected) |
| 3073 | 1544 | Normal |
| 3074 | 1544 | Normal |
| 3075 | 1544 | Normal |
| 3076 | 1544 | Normal |
| 3077 | 1544 | Normal |
| 3078 | 1544 | Normal |
| 3079 | 1544 | Normal |
| 3080 | 1544 | ️ Boss |
| 3081 | 1549 | Post-Boss |
| 3082 | 1549 | Normal (Protected) |
| 3083 | 1549 | Normal |
| 3084 | 1549 | Normal |
| 3085 | 1549 | Normal |
| 3086 | 1549 | Normal |
| 3087 | 1549 | Normal |
| 3088 | 1549 | Normal |
| 3089 | 1549 | Normal |
| 3090 | 1549 | ️ Boss |
| 3091 | 1554 | Post-Boss |
| 3092 | 1554 | Normal (Protected) |
| 3093 | 1554 | Normal |
| 3094 | 1554 | Normal |
| 3095 | 1554 | Normal |
| 3096 | 1554 | Normal |
| 3097 | 1554 | Normal |
| 3098 | 1554 | Normal |
| 3099 | 1554 | Normal |
| 3100 | 1554 | ️ Boss |
| 3101 | 1559 | Post-Boss |
| 3102 | 1559 | Normal (Protected) |
| 3103 | 1559 | Normal |
| 3104 | 1559 | Normal |
| 3105 | 1559 | Normal |
| 3106 | 1559 | Normal |
| 3107 | 1559 | Normal |
| 3108 | 1559 | Normal |
| 3109 | 1559 | Normal |
| 3110 | 1559 | ️ Boss |
| 3111 | 1564 | Post-Boss |
| 3112 | 1564 | Normal (Protected) |
| 3113 | 1564 | Normal |
| 3114 | 1564 | Normal |
| 3115 | 1564 | Normal |
| 3116 | 1564 | Normal |
| 3117 | 1564 | Normal |
| 3118 | 1564 | Normal |
| 3119 | 1564 | Normal |
| 3120 | 1564 | ️ Boss |
| 3121 | 1569 | Post-Boss |
| 3122 | 1569 | Normal (Protected) |
| 3123 | 1569 | Normal |
| 3124 | 1569 | Normal |
| 3125 | 1569 | Normal |
| 3126 | 1569 | Normal |
| 3127 | 1569 | Normal |
| 3128 | 1569 | Normal |
| 3129 | 1569 | Normal |
| 3130 | 1569 | ️ Boss |
| 3131 | 1574 | Post-Boss |
| 3132 | 1574 | Normal (Protected) |
| 3133 | 1574 | Normal |
| 3134 | 1574 | Normal |
| 3135 | 1574 | Normal |
| 3136 | 1574 | Normal |
| 3137 | 1574 | Normal |
| 3138 | 1574 | Normal |
| 3139 | 1574 | Normal |
| 3140 | 1574 | ️ Boss |
| 3141 | 1579 | Post-Boss |
| 3142 | 1579 | Normal (Protected) |
| 3143 | 1579 | Normal |
| 3144 | 1579 | Normal |
| 3145 | 1579 | Normal |
| 3146 | 1579 | Normal |
| 3147 | 1579 | Normal |
| 3148 | 1579 | Normal |
| 3149 | 1579 | Normal |
| 3150 | 1579 | ️ Boss |
| 3151 | 1584 | Post-Boss |
| 3152 | 1584 | Normal (Protected) |
| 3153 | 1584 | Normal |
| 3154 | 1584 | Normal |
| 3155 | 1584 | Normal |
| 3156 | 1584 | Normal |
| 3157 | 1584 | Normal |
| 3158 | 1584 | Normal |
| 3159 | 1584 | Normal |
| 3160 | 1584 | ️ Boss |
| 3161 | 1589 | Post-Boss |
| 3162 | 1589 | Normal (Protected) |
| 3163 | 1589 | Normal |
| 3164 | 1589 | Normal |
| 3165 | 1589 | Normal |
| 3166 | 1589 | Normal |
| 3167 | 1589 | Normal |
| 3168 | 1589 | Normal |
| 3169 | 1589 | Normal |
| 3170 | 1589 | ️ Boss |
| 3171 | 1594 | Post-Boss |
| 3172 | 1594 | Normal (Protected) |
| 3173 | 1594 | Normal |
| 3174 | 1594 | Normal |
| 3175 | 1594 | Normal |
| 3176 | 1594 | Normal |
| 3177 | 1594 | Normal |
| 3178 | 1594 | Normal |
| 3179 | 1594 | Normal |
| 3180 | 1594 | ️ Boss |
| 3181 | 1599 | Post-Boss |
| 3182 | 1599 | Normal (Protected) |
| 3183 | 1599 | Normal |
| 3184 | 1599 | Normal |
| 3185 | 1599 | Normal |
| 3186 | 1599 | Normal |
| 3187 | 1599 | Normal |
| 3188 | 1599 | Normal |
| 3189 | 1599 | Normal |
| 3190 | 1599 | ️ Boss |
| 3191 | 1604 | Post-Boss |
| 3192 | 1604 | Normal (Protected) |
| 3193 | 1604 | Normal |
| 3194 | 1604 | Normal |
| 3195 | 1604 | Normal |
| 3196 | 1604 | Normal |
| 3197 | 1604 | Normal |
| 3198 | 1604 | Normal |
| 3199 | 1604 | Normal |
| 3200 | 1604 | ️ Boss |
| 3201 | 1609 | Post-Boss |
| 3202 | 1609 | Normal (Protected) |
| 3203 | 1609 | Normal |
| 3204 | 1609 | Normal |
| 3205 | 1609 | Normal |
| 3206 | 1609 | Normal |
| 3207 | 1609 | Normal |
| 3208 | 1609 | Normal |
| 3209 | 1609 | Normal |
| 3210 | 1609 | ️ Boss |
| 3211 | 1614 | Post-Boss |
| 3212 | 1614 | Normal (Protected) |
| 3213 | 1614 | Normal |
| 3214 | 1614 | Normal |
| 3215 | 1614 | Normal |
| 3216 | 1614 | Normal |
| 3217 | 1614 | Normal |
| 3218 | 1614 | Normal |
| 3219 | 1614 | Normal |
| 3220 | 1614 | ️ Boss |
| 3221 | 1619 | Post-Boss |
| 3222 | 1619 | Normal (Protected) |
| 3223 | 1619 | Normal |
| 3224 | 1619 | Normal |
| 3225 | 1619 | Normal |
| 3226 | 1619 | Normal |
| 3227 | 1619 | Normal |
| 3228 | 1619 | Normal |
| 3229 | 1619 | Normal |
| 3230 | 1619 | ️ Boss |
| 3231 | 1624 | Post-Boss |
| 3232 | 1624 | Normal (Protected) |
| 3233 | 1624 | Normal |
| 3234 | 1624 | Normal |
| 3235 | 1624 | Normal |
| 3236 | 1624 | Normal |
| 3237 | 1624 | Normal |
| 3238 | 1624 | Normal |
| 3239 | 1624 | Normal |
| 3240 | 1624 | ️ Boss |
| 3241 | 1629 | Post-Boss |
| 3242 | 1629 | Normal (Protected) |
| 3243 | 1629 | Normal |
| 3244 | 1629 | Normal |
| 3245 | 1629 | Normal |
| 3246 | 1629 | Normal |
| 3247 | 1629 | Normal |
| 3248 | 1629 | Normal |
| 3249 | 1629 | Normal |
| 3250 | 1629 | ️ Boss |
| 3251 | 1634 | Post-Boss |
| 3252 | 1634 | Normal (Protected) |
| 3253 | 1634 | Normal |
| 3254 | 1634 | Normal |
| 3255 | 1634 | Normal |
| 3256 | 1634 | Normal |
| 3257 | 1634 | Normal |
| 3258 | 1634 | Normal |
| 3259 | 1634 | Normal |
| 3260 | 1634 | ️ Boss |
| 3261 | 1639 | Post-Boss |
| 3262 | 1639 | Normal (Protected) |
| 3263 | 1639 | Normal |
| 3264 | 1639 | Normal |
| 3265 | 1639 | Normal |
| 3266 | 1639 | Normal |
| 3267 | 1639 | Normal |
| 3268 | 1639 | Normal |
| 3269 | 1639 | Normal |
| 3270 | 1639 | ️ Boss |
| 3271 | 1644 | Post-Boss |
| 3272 | 1644 | Normal (Protected) |
| 3273 | 1644 | Normal |
| 3274 | 1644 | Normal |
| 3275 | 1644 | Normal |
| 3276 | 1644 | Normal |
| 3277 | 1644 | Normal |
| 3278 | 1644 | Normal |
| 3279 | 1644 | Normal |
| 3280 | 1644 | ️ Boss |
| 3281 | 1649 | Post-Boss |
| 3282 | 1649 | Normal (Protected) |
| 3283 | 1649 | Normal |
| 3284 | 1649 | Normal |
| 3285 | 1649 | Normal |
| 3286 | 1649 | Normal |
| 3287 | 1649 | Normal |
| 3288 | 1649 | Normal |
| 3289 | 1649 | Normal |
| 3290 | 1649 | ️ Boss |
| 3291 | 1654 | Post-Boss |
| 3292 | 1654 | Normal (Protected) |
| 3293 | 1654 | Normal |
| 3294 | 1654 | Normal |
| 3295 | 1654 | Normal |
| 3296 | 1654 | Normal |
| 3297 | 1654 | Normal |
| 3298 | 1654 | Normal |
| 3299 | 1654 | Normal |
| 3300 | 1654 | ️ Boss |
| 3301 | 1659 | Post-Boss |
| 3302 | 1659 | Normal (Protected) |
| 3303 | 1659 | Normal |
| 3304 | 1659 | Normal |
| 3305 | 1659 | Normal |
| 3306 | 1659 | Normal |
| 3307 | 1659 | Normal |
| 3308 | 1659 | Normal |
| 3309 | 1659 | Normal |
| 3310 | 1659 | ️ Boss |
| 3311 | 1664 | Post-Boss |
| 3312 | 1664 | Normal (Protected) |
| 3313 | 1664 | Normal |
| 3314 | 1664 | Normal |
| 3315 | 1664 | Normal |
| 3316 | 1664 | Normal |
| 3317 | 1664 | Normal |
| 3318 | 1664 | Normal |
| 3319 | 1664 | Normal |
| 3320 | 1664 | ️ Boss |
| 3321 | 1669 | Post-Boss |
| 3322 | 1669 | Normal (Protected) |
| 3323 | 1669 | Normal |
| 3324 | 1669 | Normal |
| 3325 | 1669 | Normal |
| 3326 | 1669 | Normal |
| 3327 | 1669 | Normal |
| 3328 | 1669 | Normal |
| 3329 | 1669 | Normal |
| 3330 | 1669 | ️ Boss |
| 3331 | 1674 | Post-Boss |
| 3332 | 1674 | Normal (Protected) |
| 3333 | 1674 | Normal |
| 3334 | 1674 | Normal |
| 3335 | 1674 | Normal |
| 3336 | 1674 | Normal |
| 3337 | 1674 | Normal |
| 3338 | 1674 | Normal |
| 3339 | 1674 | Normal |
| 3340 | 1674 | ️ Boss |
| 3341 | 1679 | Post-Boss |
| 3342 | 1679 | Normal (Protected) |
| 3343 | 1679 | Normal |
| 3344 | 1679 | Normal |
| 3345 | 1679 | Normal |
| 3346 | 1679 | Normal |
| 3347 | 1679 | Normal |
| 3348 | 1679 | Normal |
| 3349 | 1679 | Normal |
| 3350 | 1679 | ️ Boss |
| 3351 | 1684 | Post-Boss |
| 3352 | 1684 | Normal (Protected) |
| 3353 | 1684 | Normal |
| 3354 | 1684 | Normal |
| 3355 | 1684 | Normal |
| 3356 | 1684 | Normal |
| 3357 | 1684 | Normal |
| 3358 | 1684 | Normal |
| 3359 | 1684 | Normal |
| 3360 | 1684 | ️ Boss |
| 3361 | 1689 | Post-Boss |
| 3362 | 1689 | Normal (Protected) |
| 3363 | 1689 | Normal |
| 3364 | 1689 | Normal |
| 3365 | 1689 | Normal |
| 3366 | 1689 | Normal |
| 3367 | 1689 | Normal |
| 3368 | 1689 | Normal |
| 3369 | 1689 | Normal |
| 3370 | 1689 | ️ Boss |
| 3371 | 1694 | Post-Boss |
| 3372 | 1694 | Normal (Protected) |
| 3373 | 1694 | Normal |
| 3374 | 1694 | Normal |
| 3375 | 1694 | Normal |
| 3376 | 1694 | Normal |
| 3377 | 1694 | Normal |
| 3378 | 1694 | Normal |
| 3379 | 1694 | Normal |
| 3380 | 1694 | ️ Boss |
| 3381 | 1699 | Post-Boss |
| 3382 | 1699 | Normal (Protected) |
| 3383 | 1699 | Normal |
| 3384 | 1699 | Normal |
| 3385 | 1699 | Normal |
| 3386 | 1699 | Normal |
| 3387 | 1699 | Normal |
| 3388 | 1699 | Normal |
| 3389 | 1699 | Normal |
| 3390 | 1699 | ️ Boss |
| 3391 | 1704 | Post-Boss |
| 3392 | 1704 | Normal (Protected) |
| 3393 | 1704 | Normal |
| 3394 | 1704 | Normal |
| 3395 | 1704 | Normal |
| 3396 | 1704 | Normal |
| 3397 | 1704 | Normal |
| 3398 | 1704 | Normal |
| 3399 | 1704 | Normal |
| 3400 | 1704 | ️ Boss |
| 3401 | 1709 | Post-Boss |
| 3402 | 1709 | Normal (Protected) |
| 3403 | 1709 | Normal |
| 3404 | 1709 | Normal |
| 3405 | 1709 | Normal |
| 3406 | 1709 | Normal |
| 3407 | 1709 | Normal |
| 3408 | 1709 | Normal |
| 3409 | 1709 | Normal |
| 3410 | 1709 | ️ Boss |
| 3411 | 1714 | Post-Boss |
| 3412 | 1714 | Normal (Protected) |
| 3413 | 1714 | Normal |
| 3414 | 1714 | Normal |
| 3415 | 1714 | Normal |
| 3416 | 1714 | Normal |
| 3417 | 1714 | Normal |
| 3418 | 1714 | Normal |
| 3419 | 1714 | Normal |
| 3420 | 1714 | ️ Boss |
| 3421 | 1719 | Post-Boss |
| 3422 | 1719 | Normal (Protected) |
| 3423 | 1719 | Normal |
| 3424 | 1719 | Normal |
| 3425 | 1719 | Normal |
| 3426 | 1719 | Normal |
| 3427 | 1719 | Normal |
| 3428 | 1719 | Normal |
| 3429 | 1719 | Normal |
| 3430 | 1719 | ️ Boss |
| 3431 | 1724 | Post-Boss |
| 3432 | 1724 | Normal (Protected) |
| 3433 | 1724 | Normal |
| 3434 | 1724 | Normal |
| 3435 | 1724 | Normal |
| 3436 | 1724 | Normal |
| 3437 | 1724 | Normal |
| 3438 | 1724 | Normal |
| 3439 | 1724 | Normal |
| 3440 | 1724 | ️ Boss |
| 3441 | 1729 | Post-Boss |
| 3442 | 1729 | Normal (Protected) |
| 3443 | 1729 | Normal |
| 3444 | 1729 | Normal |
| 3445 | 1729 | Normal |
| 3446 | 1729 | Normal |
| 3447 | 1729 | Normal |
| 3448 | 1729 | Normal |
| 3449 | 1729 | Normal |
| 3450 | 1729 | ️ Boss |
| 3451 | 1734 | Post-Boss |
| 3452 | 1734 | Normal (Protected) |
| 3453 | 1734 | Normal |
| 3454 | 1734 | Normal |
| 3455 | 1734 | Normal |
| 3456 | 1734 | Normal |
| 3457 | 1734 | Normal |
| 3458 | 1734 | Normal |
| 3459 | 1734 | Normal |
| 3460 | 1734 | ️ Boss |
| 3461 | 1739 | Post-Boss |
| 3462 | 1739 | Normal (Protected) |
| 3463 | 1739 | Normal |
| 3464 | 1739 | Normal |
| 3465 | 1739 | Normal |
| 3466 | 1739 | Normal |
| 3467 | 1739 | Normal |
| 3468 | 1739 | Normal |
| 3469 | 1739 | Normal |
| 3470 | 1739 | ️ Boss |
| 3471 | 1744 | Post-Boss |
| 3472 | 1744 | Normal (Protected) |
| 3473 | 1744 | Normal |
| 3474 | 1744 | Normal |
| 3475 | 1744 | Normal |
| 3476 | 1744 | Normal |
| 3477 | 1744 | Normal |
| 3478 | 1744 | Normal |
| 3479 | 1744 | Normal |
| 3480 | 1744 | ️ Boss |
| 3481 | 1749 | Post-Boss |
| 3482 | 1749 | Normal (Protected) |
| 3483 | 1749 | Normal |
| 3484 | 1749 | Normal |
| 3485 | 1749 | Normal |
| 3486 | 1749 | Normal |
| 3487 | 1749 | Normal |
| 3488 | 1749 | Normal |
| 3489 | 1749 | Normal |
| 3490 | 1749 | ️ Boss |
| 3491 | 1754 | Post-Boss |
| 3492 | 1754 | Normal (Protected) |
| 3493 | 1754 | Normal |
| 3494 | 1754 | Normal |
| 3495 | 1754 | Normal |
| 3496 | 1754 | Normal |
| 3497 | 1754 | Normal |
| 3498 | 1754 | Normal |
| 3499 | 1754 | Normal |
| 3500 | 1754 | ️ Boss |
| 3501 | 1759 | Post-Boss |
| 3502 | 1759 | Normal (Protected) |
| 3503 | 1759 | Normal |
| 3504 | 1759 | Normal |
| 3505 | 1759 | Normal |
| 3506 | 1759 | Normal |
| 3507 | 1759 | Normal |
| 3508 | 1759 | Normal |
| 3509 | 1759 | Normal |
| 3510 | 1759 | ️ Boss |
| 3511 | 1764 | Post-Boss |
| 3512 | 1764 | Normal (Protected) |
| 3513 | 1764 | Normal |
| 3514 | 1764 | Normal |
| 3515 | 1764 | Normal |
| 3516 | 1764 | Normal |
| 3517 | 1764 | Normal |
| 3518 | 1764 | Normal |
| 3519 | 1764 | Normal |
| 3520 | 1764 | ️ Boss |
| 3521 | 1769 | Post-Boss |
| 3522 | 1769 | Normal (Protected) |
| 3523 | 1769 | Normal |
| 3524 | 1769 | Normal |
| 3525 | 1769 | Normal |
| 3526 | 1769 | Normal |
| 3527 | 1769 | Normal |
| 3528 | 1769 | Normal |
| 3529 | 1769 | Normal |
| 3530 | 1769 | ️ Boss |
| 3531 | 1774 | Post-Boss |
| 3532 | 1774 | Normal (Protected) |
| 3533 | 1774 | Normal |
| 3534 | 1774 | Normal |
| 3535 | 1774 | Normal |
| 3536 | 1774 | Normal |
| 3537 | 1774 | Normal |
| 3538 | 1774 | Normal |
| 3539 | 1774 | Normal |
| 3540 | 1774 | ️ Boss |
| 3541 | 1779 | Post-Boss |
| 3542 | 1779 | Normal (Protected) |
| 3543 | 1779 | Normal |
| 3544 | 1779 | Normal |
| 3545 | 1779 | Normal |
| 3546 | 1779 | Normal |
| 3547 | 1779 | Normal |
| 3548 | 1779 | Normal |
| 3549 | 1779 | Normal |
| 3550 | 1779 | ️ Boss |
| 3551 | 1784 | Post-Boss |
| 3552 | 1784 | Normal (Protected) |
| 3553 | 1784 | Normal |
| 3554 | 1784 | Normal |
| 3555 | 1784 | Normal |
| 3556 | 1784 | Normal |
| 3557 | 1784 | Normal |
| 3558 | 1784 | Normal |
| 3559 | 1784 | Normal |
| 3560 | 1784 | ️ Boss |
| 3561 | 1789 | Post-Boss |
| 3562 | 1789 | Normal (Protected) |
| 3563 | 1789 | Normal |
| 3564 | 1789 | Normal |
| 3565 | 1789 | Normal |
| 3566 | 1789 | Normal |
| 3567 | 1789 | Normal |
| 3568 | 1789 | Normal |
| 3569 | 1789 | Normal |
| 3570 | 1789 | ️ Boss |
| 3571 | 1794 | Post-Boss |
| 3572 | 1794 | Normal (Protected) |
| 3573 | 1794 | Normal |
| 3574 | 1794 | Normal |
| 3575 | 1794 | Normal |
| 3576 | 1794 | Normal |
| 3577 | 1794 | Normal |
| 3578 | 1794 | Normal |
| 3579 | 1794 | Normal |
| 3580 | 1794 | ️ Boss |
| 3581 | 1799 | Post-Boss |
| 3582 | 1799 | Normal (Protected) |
| 3583 | 1799 | Normal |
| 3584 | 1799 | Normal |
| 3585 | 1799 | Normal |
| 3586 | 1799 | Normal |
| 3587 | 1799 | Normal |
| 3588 | 1799 | Normal |
| 3589 | 1799 | Normal |
| 3590 | 1799 | ️ Boss |
| 3591 | 1804 | Post-Boss |
| 3592 | 1804 | Normal (Protected) |
| 3593 | 1804 | Normal |
| 3594 | 1804 | Normal |
| 3595 | 1804 | Normal |
| 3596 | 1804 | Normal |
| 3597 | 1804 | Normal |
| 3598 | 1804 | Normal |
| 3599 | 1804 | Normal |
| 3600 | 1804 | ️ Boss |
| 3601 | 1809 | Post-Boss |
| 3602 | 1809 | Normal (Protected) |
| 3603 | 1809 | Normal |
| 3604 | 1809 | Normal |
| 3605 | 1809 | Normal |
| 3606 | 1809 | Normal |
| 3607 | 1809 | Normal |
| 3608 | 1809 | Normal |
| 3609 | 1809 | Normal |
| 3610 | 1809 | ️ Boss |
| 3611 | 1814 | Post-Boss |
| 3612 | 1814 | Normal (Protected) |
| 3613 | 1814 | Normal |
| 3614 | 1814 | Normal |
| 3615 | 1814 | Normal |
| 3616 | 1814 | Normal |
| 3617 | 1814 | Normal |
| 3618 | 1814 | Normal |
| 3619 | 1814 | Normal |
| 3620 | 1814 | ️ Boss |
| 3621 | 1819 | Post-Boss |
| 3622 | 1819 | Normal (Protected) |
| 3623 | 1819 | Normal |
| 3624 | 1819 | Normal |
| 3625 | 1819 | Normal |
| 3626 | 1819 | Normal |
| 3627 | 1819 | Normal |
| 3628 | 1819 | Normal |
| 3629 | 1819 | Normal |
| 3630 | 1819 | ️ Boss |
| 3631 | 1824 | Post-Boss |
| 3632 | 1824 | Normal (Protected) |
| 3633 | 1824 | Normal |
| 3634 | 1824 | Normal |
| 3635 | 1824 | Normal |
| 3636 | 1824 | Normal |
| 3637 | 1824 | Normal |
| 3638 | 1824 | Normal |
| 3639 | 1824 | Normal |
| 3640 | 1824 | ️ Boss |
| 3641 | 1829 | Post-Boss |
| 3642 | 1829 | Normal (Protected) |
| 3643 | 1829 | Normal |
| 3644 | 1829 | Normal |
| 3645 | 1829 | Normal |
| 3646 | 1829 | Normal |
| 3647 | 1829 | Normal |
| 3648 | 1829 | Normal |
| 3649 | 1829 | Normal |
| 3650 | 1829 | ️ Boss |
| 3651 | 1834 | Post-Boss |
| 3652 | 1834 | Normal (Protected) |
| 3653 | 1834 | Normal |
| 3654 | 1834 | Normal |
| 3655 | 1834 | Normal |
| 3656 | 1834 | Normal |
| 3657 | 1834 | Normal |
| 3658 | 1834 | Normal |
| 3659 | 1834 | Normal |
| 3660 | 1834 | ️ Boss |
| 3661 | 1839 | Post-Boss |
| 3662 | 1839 | Normal (Protected) |
| 3663 | 1839 | Normal |
| 3664 | 1839 | Normal |
| 3665 | 1839 | Normal |
| 3666 | 1839 | Normal |
| 3667 | 1839 | Normal |
| 3668 | 1839 | Normal |
| 3669 | 1839 | Normal |
| 3670 | 1839 | ️ Boss |
| 3671 | 1844 | Post-Boss |
| 3672 | 1844 | Normal (Protected) |
| 3673 | 1844 | Normal |
| 3674 | 1844 | Normal |
| 3675 | 1844 | Normal |
| 3676 | 1844 | Normal |
| 3677 | 1844 | Normal |
| 3678 | 1844 | Normal |
| 3679 | 1844 | Normal |
| 3680 | 1844 | ️ Boss |
| 3681 | 1849 | Post-Boss |
| 3682 | 1849 | Normal (Protected) |
| 3683 | 1849 | Normal |
| 3684 | 1849 | Normal |
| 3685 | 1849 | Normal |
| 3686 | 1849 | Normal |
| 3687 | 1849 | Normal |
| 3688 | 1849 | Normal |
| 3689 | 1849 | Normal |
| 3690 | 1849 | ️ Boss |
| 3691 | 1854 | Post-Boss |
| 3692 | 1854 | Normal (Protected) |
| 3693 | 1854 | Normal |
| 3694 | 1854 | Normal |
| 3695 | 1854 | Normal |
| 3696 | 1854 | Normal |
| 3697 | 1854 | Normal |
| 3698 | 1854 | Normal |
| 3699 | 1854 | Normal |
| 3700 | 1854 | ️ Boss |
| 3701 | 1859 | Post-Boss |
| 3702 | 1859 | Normal (Protected) |
| 3703 | 1859 | Normal |
| 3704 | 1859 | Normal |
| 3705 | 1859 | Normal |
| 3706 | 1859 | Normal |
| 3707 | 1859 | Normal |
| 3708 | 1859 | Normal |
| 3709 | 1859 | Normal |
| 3710 | 1859 | ️ Boss |
| 3711 | 1864 | Post-Boss |
| 3712 | 1864 | Normal (Protected) |
| 3713 | 1864 | Normal |
| 3714 | 1864 | Normal |
| 3715 | 1864 | Normal |
| 3716 | 1864 | Normal |
| 3717 | 1864 | Normal |
| 3718 | 1864 | Normal |
| 3719 | 1864 | Normal |
| 3720 | 1864 | ️ Boss |
| 3721 | 1869 | Post-Boss |
| 3722 | 1869 | Normal (Protected) |
| 3723 | 1869 | Normal |
| 3724 | 1869 | Normal |
| 3725 | 1869 | Normal |
| 3726 | 1869 | Normal |
| 3727 | 1869 | Normal |
| 3728 | 1869 | Normal |
| 3729 | 1869 | Normal |
| 3730 | 1869 | ️ Boss |
| 3731 | 1874 | Post-Boss |
| 3732 | 1874 | Normal (Protected) |
| 3733 | 1874 | Normal |
| 3734 | 1874 | Normal |
| 3735 | 1874 | Normal |
| 3736 | 1874 | Normal |
| 3737 | 1874 | Normal |
| 3738 | 1874 | Normal |
| 3739 | 1874 | Normal |
| 3740 | 1874 | ️ Boss |
| 3741 | 1879 | Post-Boss |
| 3742 | 1879 | Normal (Protected) |
| 3743 | 1879 | Normal |
| 3744 | 1879 | Normal |
| 3745 | 1879 | Normal |
| 3746 | 1879 | Normal |
| 3747 | 1879 | Normal |
| 3748 | 1879 | Normal |
| 3749 | 1879 | Normal |
| 3750 | 1879 | ️ Boss |
| 3751 | 1884 | Post-Boss |
| 3752 | 1884 | Normal (Protected) |
| 3753 | 1884 | Normal |
| 3754 | 1884 | Normal |
| 3755 | 1884 | Normal |
| 3756 | 1884 | Normal |
| 3757 | 1884 | Normal |
| 3758 | 1884 | Normal |
| 3759 | 1884 | Normal |
| 3760 | 1884 | ️ Boss |
| 3761 | 1889 | Post-Boss |
| 3762 | 1889 | Normal (Protected) |
| 3763 | 1889 | Normal |
| 3764 | 1889 | Normal |
| 3765 | 1889 | Normal |
| 3766 | 1889 | Normal |
| 3767 | 1889 | Normal |
| 3768 | 1889 | Normal |
| 3769 | 1889 | Normal |
| 3770 | 1889 | ️ Boss |
| 3771 | 1894 | Post-Boss |
| 3772 | 1894 | Normal (Protected) |
| 3773 | 1894 | Normal |
| 3774 | 1894 | Normal |
| 3775 | 1894 | Normal |
| 3776 | 1894 | Normal |
| 3777 | 1894 | Normal |
| 3778 | 1894 | Normal |
| 3779 | 1894 | Normal |
| 3780 | 1894 | ️ Boss |
| 3781 | 1899 | Post-Boss |
| 3782 | 1899 | Normal (Protected) |
| 3783 | 1899 | Normal |
| 3784 | 1899 | Normal |
| 3785 | 1899 | Normal |
| 3786 | 1899 | Normal |
| 3787 | 1899 | Normal |
| 3788 | 1899 | Normal |
| 3789 | 1899 | Normal |
| 3790 | 1899 | ️ Boss |
| 3791 | 1904 | Post-Boss |
| 3792 | 1904 | Normal (Protected) |
| 3793 | 1904 | Normal |
| 3794 | 1904 | Normal |
| 3795 | 1904 | Normal |
| 3796 | 1904 | Normal |
| 3797 | 1904 | Normal |
| 3798 | 1904 | Normal |
| 3799 | 1904 | Normal |
| 3800 | 1904 | ️ Boss |
| 3801 | 1909 | Post-Boss |
| 3802 | 1909 | Normal (Protected) |
| 3803 | 1909 | Normal |
| 3804 | 1909 | Normal |
| 3805 | 1909 | Normal |
| 3806 | 1909 | Normal |
| 3807 | 1909 | Normal |
| 3808 | 1909 | Normal |
| 3809 | 1909 | Normal |
| 3810 | 1909 | ️ Boss |
| 3811 | 1914 | Post-Boss |
| 3812 | 1914 | Normal (Protected) |
| 3813 | 1914 | Normal |
| 3814 | 1914 | Normal |
| 3815 | 1914 | Normal |
| 3816 | 1914 | Normal |
| 3817 | 1914 | Normal |
| 3818 | 1914 | Normal |
| 3819 | 1914 | Normal |
| 3820 | 1914 | ️ Boss |
| 3821 | 1919 | Post-Boss |
| 3822 | 1919 | Normal (Protected) |
| 3823 | 1919 | Normal |
| 3824 | 1919 | Normal |
| 3825 | 1919 | Normal |
| 3826 | 1919 | Normal |
| 3827 | 1919 | Normal |
| 3828 | 1919 | Normal |
| 3829 | 1919 | Normal |
| 3830 | 1919 | ️ Boss |
| 3831 | 1924 | Post-Boss |
| 3832 | 1924 | Normal (Protected) |
| 3833 | 1924 | Normal |
| 3834 | 1924 | Normal |
| 3835 | 1924 | Normal |
| 3836 | 1924 | Normal |
| 3837 | 1924 | Normal |
| 3838 | 1924 | Normal |
| 3839 | 1924 | Normal |
| 3840 | 1924 | ️ Boss |
| 3841 | 1929 | Post-Boss |
| 3842 | 1929 | Normal (Protected) |
| 3843 | 1929 | Normal |
| 3844 | 1929 | Normal |
| 3845 | 1929 | Normal |
| 3846 | 1929 | Normal |
| 3847 | 1929 | Normal |
| 3848 | 1929 | Normal |
| 3849 | 1929 | Normal |
| 3850 | 1929 | ️ Boss |
| 3851 | 1934 | Post-Boss |
| 3852 | 1934 | Normal (Protected) |
| 3853 | 1934 | Normal |
| 3854 | 1934 | Normal |
| 3855 | 1934 | Normal |
| 3856 | 1934 | Normal |
| 3857 | 1934 | Normal |
| 3858 | 1934 | Normal |
| 3859 | 1934 | Normal |
| 3860 | 1934 | ️ Boss |
| 3861 | 1939 | Post-Boss |
| 3862 | 1939 | Normal (Protected) |
| 3863 | 1939 | Normal |
| 3864 | 1939 | Normal |
| 3865 | 1939 | Normal |
| 3866 | 1939 | Normal |
| 3867 | 1939 | Normal |
| 3868 | 1939 | Normal |
| 3869 | 1939 | Normal |
| 3870 | 1939 | ️ Boss |
| 3871 | 1944 | Post-Boss |
| 3872 | 1944 | Normal (Protected) |
| 3873 | 1944 | Normal |
| 3874 | 1944 | Normal |
| 3875 | 1944 | Normal |
| 3876 | 1944 | Normal |
| 3877 | 1944 | Normal |
| 3878 | 1944 | Normal |
| 3879 | 1944 | Normal |
| 3880 | 1944 | ️ Boss |
| 3881 | 1949 | Post-Boss |
| 3882 | 1949 | Normal (Protected) |
| 3883 | 1949 | Normal |
| 3884 | 1949 | Normal |
| 3885 | 1949 | Normal |
| 3886 | 1949 | Normal |
| 3887 | 1949 | Normal |
| 3888 | 1949 | Normal |
| 3889 | 1949 | Normal |
| 3890 | 1949 | ️ Boss |
| 3891 | 1954 | Post-Boss |
| 3892 | 1954 | Normal (Protected) |
| 3893 | 1954 | Normal |
| 3894 | 1954 | Normal |
| 3895 | 1954 | Normal |
| 3896 | 1954 | Normal |
| 3897 | 1954 | Normal |
| 3898 | 1954 | Normal |
| 3899 | 1954 | Normal |
| 3900 | 1954 | ️ Boss |
| 3901 | 1959 | Post-Boss |
| 3902 | 1959 | Normal (Protected) |
| 3903 | 1959 | Normal |
| 3904 | 1959 | Normal |
| 3905 | 1959 | Normal |
| 3906 | 1959 | Normal |
| 3907 | 1959 | Normal |
| 3908 | 1959 | Normal |
| 3909 | 1959 | Normal |
| 3910 | 1959 | ️ Boss |
| 3911 | 1964 | Post-Boss |
| 3912 | 1964 | Normal (Protected) |
| 3913 | 1964 | Normal |
| 3914 | 1964 | Normal |
| 3915 | 1964 | Normal |
| 3916 | 1964 | Normal |
| 3917 | 1964 | Normal |
| 3918 | 1964 | Normal |
| 3919 | 1964 | Normal |
| 3920 | 1964 | ️ Boss |
| 3921 | 1969 | Post-Boss |
| 3922 | 1969 | Normal (Protected) |
| 3923 | 1969 | Normal |
| 3924 | 1969 | Normal |
| 3925 | 1969 | Normal |
| 3926 | 1969 | Normal |
| 3927 | 1969 | Normal |
| 3928 | 1969 | Normal |
| 3929 | 1969 | Normal |
| 3930 | 1969 | ️ Boss |
| 3931 | 1974 | Post-Boss |
| 3932 | 1974 | Normal (Protected) |
| 3933 | 1974 | Normal |
| 3934 | 1974 | Normal |
| 3935 | 1974 | Normal |
| 3936 | 1974 | Normal |
| 3937 | 1974 | Normal |
| 3938 | 1974 | Normal |
| 3939 | 1974 | Normal |
| 3940 | 1974 | ️ Boss |
| 3941 | 1979 | Post-Boss |
| 3942 | 1979 | Normal (Protected) |
| 3943 | 1979 | Normal |
| 3944 | 1979 | Normal |
| 3945 | 1979 | Normal |
| 3946 | 1979 | Normal |
| 3947 | 1979 | Normal |
| 3948 | 1979 | Normal |
| 3949 | 1979 | Normal |
| 3950 | 1979 | ️ Boss |
| 3951 | 1984 | Post-Boss |
| 3952 | 1984 | Normal (Protected) |
| 3953 | 1984 | Normal |
| 3954 | 1984 | Normal |
| 3955 | 1984 | Normal |
| 3956 | 1984 | Normal |
| 3957 | 1984 | Normal |
| 3958 | 1984 | Normal |
| 3959 | 1984 | Normal |
| 3960 | 1984 | ️ Boss |
| 3961 | 1989 | Post-Boss |
| 3962 | 1989 | Normal (Protected) |
| 3963 | 1989 | Normal |
| 3964 | 1989 | Normal |
| 3965 | 1989 | Normal |
| 3966 | 1989 | Normal |
| 3967 | 1989 | Normal |
| 3968 | 1989 | Normal |
| 3969 | 1989 | Normal |
| 3970 | 1989 | ️ Boss |
| 3971 | 1994 | Post-Boss |
| 3972 | 1994 | Normal (Protected) |
| 3973 | 1994 | Normal |
| 3974 | 1994 | Normal |
| 3975 | 1994 | Normal |
| 3976 | 1994 | Normal |
| 3977 | 1994 | Normal |
| 3978 | 1994 | Normal |
| 3979 | 1994 | Normal |
| 3980 | 1994 | ️ Boss |
| 3981 | 1999 | Post-Boss |
| 3982 | 1999 | Normal (Protected) |
| 3983 | 1999 | Normal |
| 3984 | 1999 | Normal |
| 3985 | 1999 | Normal |
| 3986 | 1999 | Normal |
| 3987 | 1999 | Normal |
| 3988 | 1999 | Normal |
| 3989 | 1999 | Normal |
| 3990 | 1999 | ️ Boss |
| 3991 | 2004 | Post-Boss |
| 3992 | 2004 | Normal (Protected) |
| 3993 | 2004 | Normal |
| 3994 | 2004 | Normal |
| 3995 | 2004 | Normal |
| 3996 | 2004 | Normal |
| 3997 | 2004 | Normal |
| 3998 | 2004 | Normal |
| 3999 | 2004 | Normal |
| 4000 | 2004 | ️ Boss |
