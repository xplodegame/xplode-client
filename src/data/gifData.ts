// gifData.ts
// Define types
export interface GifNft {
  id: number;
  name: string;
  price: number;
  url: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  count: number;
  collectionMintId: string;
  candyMachineId: string;
}

// GIF NFT data with paths updated to use public assets folder and candy machine IDs from env variables
export const gifNfts: GifNft[] = [
  {
    id: 1,
    name: "Adult Dance",
    price: 1,
    url: "/assets/gifs/Adult Swim Dance GIF.gif",
    rarity: "Rare",
    count: 500,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_1 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_1 || ""
  },
  {
    id: 2,
    name: "Angry Lizard",
    price: 10,
    url: "/assets/gifs/Angry GIF.gif",
    rarity: "Legendary",
    count: 50,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_2 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_2 || ""
  },
  {
    id: 3,
    name: "Take This L",
    price: 0.1,
    url: "/assets/gifs/Animation Smile by Mashed.gif",
    rarity: "Common",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_3 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_3 || ""
  },
  {
    id: 4,
    name: "Chad Eyebrow",
    price: 50,
    url: "/assets/gifs/Bear Reaction GIF - The Comedy Bar.gif",
    rarity: "Mythic",
    count: 10,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_4 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_4 || ""
  },
  {
    id: 5,
    name: "Opponent Down",
    price: 5,
    url: "/assets/gifs/Celebrate Good Game GIF by Nounish.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_5 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_5 || ""
  },
  {
    id: 6,
    name: "Come to Papa",
    price: 10,
    url: "/assets/gifs/Dick Armstrong GIF by gifnews.gif",
    rarity: "Legendary",
    count: 50,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_6 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_6 || ""
  },
  {
    id: 7,
    name: "Shake It",
    price: 0.1,
    url: "/assets/gifs/Excited Shake It GIF by Sherchle.gif",
    rarity: "Common",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_7 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_7 || ""
  },
  {
    id: 8,
    name: "Happy Excitement",
    price: 1,
    url: "/assets/gifs/Happy Excitement GIF.gif",
    rarity: "Rare",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_8 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_8 || ""
  },
  {
    id: 9,
    name: "Happy Robot",
    price: 5,
    url: "/assets/gifs/Happy Robot GIF.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_9 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_9 || ""
  },
  {
    id: 10,
    name: "Simpson Ahhhhh!",
    price: 50,
    url: "/assets/gifs/Homer Simpson Reaction GIF.gif",
    rarity: "Mythic",
    count: 10,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_10 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_10 || ""
  },
  {
    id: 11,
    name: "Middle Finger",
    price: 1,
    url: "/assets/gifs/Middle Finger GIF.gif",
    rarity: "Rare",
    count: 500,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_11 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_11 || ""
  },
  {
    id: 12,
    name: "Sad SpongeBob",
    price: 5,
    url: "/assets/gifs/Sad Cry SpongeBob GIF.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_12 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_12 || ""
  },
  {
    id: 13,
    name: "Stellar Genesis",
    price: 5,
    url: "/assets/gifs/Suck It Ha Ha GIF Pudgy Penguins.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_13 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_13 || ""
  },
  {
    id: 14,
    name: "Saw That",
    price: 5,
    url: "/assets/gifs/Sexy Funny Face GIF by Globkins.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_14 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_14 || ""
  },
  {
    id: 15,
    name: "Cute Penguin",
    price: 5,
    url: "/assets/gifs/Suck It Ha Ha GIF Pudgy Penguins.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_15 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_15 || ""
  },
  {
    id: 16,
    name: "Thinking Ninja",
    price: 5,
    url: "/assets/gifs/Teenage Mutant Ninja Turtles GIF.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_16 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_16 || ""
  },
  {
    id: 17,
    name: "Only Love",
    price: 5,
    url: "/assets/gifs/Valentines Day Love GIF.gif",
    rarity: "Epic",
    count: 100,
    collectionMintId: import.meta.env.VITE_COLLECTION_ID_17 || "",
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID_17 || ""
  },
];

// Helper function to get Candy Machine ID by GIF ID
export function getCandyMachineIdByGifId(gifId: number): string {
  const gif = gifNfts.find(gif => gif.id === gifId);
  return gif?.candyMachineId || import.meta.env.VITE_CANDY_MACHINE_ID || "";
}

// Helper function to get Collection Mint ID by GIF ID
export function getCollectionMintIdByGifId(gifId: number): string {
  const gif = gifNfts.find(gif => gif.id === gifId);
  return gif?.collectionMintId || import.meta.env.VITE_COLLECTION_ID || "";
}