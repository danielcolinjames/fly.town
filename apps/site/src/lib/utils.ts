const sampleEmojis = [
  // Smiley faces & emotion
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '☺️',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🥸',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
  '🤠',
  '😈',
  '👿',
  '👹',
  '👺',
  '🤡',
  '💩',
  '👻',
  '💀',
  '☠️',
  '👽',
  '👾',
  '🤖',

  // Animals & Nature
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐻‍❄️',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐷',
  '🐸',
  '🐵',
  '🙈',
  '🙉',
  '🙊',
  '🐒',
  // ... many more animals ...

  // Food & Drink
  '🍏',
  '🍎',
  '🍐',
  '🍊',
  '🍋',
  '🍌',
  '🍉',
  '🍇',
  '🍓',
  '🫐',
  '🍈',
  '🍒',
  '🍑',
  '🥭',
  '🍍',
  '🥥',
  '🥝',
  '🍅',
  '🍆',
  '🥑',
  // ... many more food items ...

  // Activity
  '⚽',
  '🏀',
  '🏈',
  '⚾',
  '🥎',
  '🎾',
  '🏐',
  '🏉',
  '🥏',
  '🎱',
  '🪀',
  '🏓',
  '🏸',
  '🏒',
  '🏑',
  '🥍',
  '🏏',
  '🪃',
  '🥅',
  '⛳',
  // ... more activities ...

  // Travel & Places
  '🚗',
  '🚕',
  '🚙',
  '🚌',
  '🚎',
  '🏎',
  '🚓',
  '🚑',
  '🚒',
  '🚐',
  '🚚',
  '🚛',
  '🚜',
  '🏍',
  '🛵',
  '🦽',
  '🦼',
  '🛺',
  '🚲',
  '🛴',
  // ... more vehicles and places ...

  // Objects
  '⌚',
  '📱',
  '📲',
  '💻',
  '⌨️',
  '🖥',
  '🖨',
  '🖱',
  '🖲',
  '🕹',
  '🗜',
  '💽',
  '💾',
  '💿',
  '📀',
  '🧮',
  '🎥',
  '🎞',
  '📽',
  '📺',
  // ... more objects ...

  // Symbols
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🖤',
  '🤍',
  '🤎',
  '💔',
  '❣️',
  '💕',
  '💞',
  '💓',
  '💗',
  '💖',
  '💘',
  '💝',
  '💟',
  '☮️',
  // ... more symbols ...

  // Flags
  '🏁',
  '🚩',
  '🎌',
  '🏴',
  '🏳️',
  '🏳️‍🌈',
  '🏴‍☠️',
  // ... country flags ...
]

export function getRandomEmoji(): string {
  return sampleEmojis[Math.floor(Math.random() * sampleEmojis.length)]
}

// export function getRandomEmoji(): string {
//   const emojiRanges = [
//     [0x1_F6_00, 0x1_F6_4F], // Emoticons
//     [0x1_F3_00, 0x1_F5_FF], // Misc Symbols and Pictographs
//     [0x1_F6_80, 0x1_F6_FF], // Transport and Map Symbols
//     [0x1_F9_00, 0x1_F9_FF], // Supplemental Symbols and Pictographs
//     [0x26_00, 0x26_FF],   // Misc Symbols
//     [0x27_00, 0x27_BF],   // Dingbats
//     [0x1_F1_E6, 0x1_F1_FF], // Flags
//     [0x1_F2_01, 0x1_F2_FF], // Enclosed Characters
//     [0x1_F3_21, 0x1_F3_2C], // Weather and Astronomical Symbols
//     [0x1_F3_36, 0x1_F3_7C], // Food and Drink
//     [0x1_F3_80, 0x1_F3_93], // Celebration Symbols
//     [0x1_F3_A0, 0x1_F3_CA], // Activity and Sport Symbols
//     [0x1_F3_E0, 0x1_F3_F0], // Buildings and Places
//     [0x1_F4_00, 0x1_F4_3E], // Animals
//     [0x1_F4_40, 0x1_F4_41], // Eyes
//     [0x1_F4_F7, 0x1_F4_FA], // Camera and Video
//     [0x1_F4_FD, 0x1_F4_FF], // Film and Audio
//     [0x1_F5_3B, 0x1_F5_3D], // Red Triangle Pointed Down
//     // ...additional ranges if desired...
// ];

//     const range = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];
//     let emoji = "";

//     while (emoji.length === 0) {
//         const codePoint = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
//         emoji = String.fromCodePoint(codePoint);

//         // Additional validation can be added here to check if the codePoint is a valid emoji
//     }

//     return emoji;
//   }
