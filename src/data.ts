import { Observation, Badge } from './types';

export const INITIAL_OBSERVATIONS: Observation[] = [
  {
    id: 'obs-1',
    title: '강낭콩 싹이 났어요! 🌱',
    date: '2023-10-24',
    weather: 'sunny',
    category: 'plant',
    description: '오늘 아침에 일어나서 화분을 보니 흙 위로 연두색 작은 싹이 빼꼼 나와있었다. 너무너무 귀엽고 신기했다! 물을 조심조심 듬뿍 주었다. 내일은 얼마나 자라 있을까?',
    tags: ['강낭콩', '새싹', '귀여워'],
    emoji: '🌱'
  },
  {
    id: 'obs-2',
    title: '운동장에서 본 노랑나비 🦋',
    date: '2023-10-20',
    weather: 'sunny',
    category: 'insect',
    description: '체육 시간에 운동장 화단에서 노란색 예쁜 나비를 봤다. 나풀나풀 날아가는 모습이 꼭 춤을 추는 것 같았다. 민들레 꽃 위에 살포시 앉아서 꿀을 먹고 있었다.',
    tags: ['노랑나비', '민들레꽃', '화단'],
    emoji: '🦋'
  },
  {
    id: 'obs-3',
    title: '갑자기 비가 많이 온 날 🌧️',
    date: '2023-10-15',
    weather: 'rainy',
    category: 'weather',
    description: '학교 끝나고 집에 오는데 갑자기 하늘이 어두워지더니 비가 쏴아아 쏟아졌다. 길가에 귀여운 지렁이들이 비를 맞으러 흙 밖으로 나와 있었다. 밟지 않으려고 폴짝폴짝 피해서 집에 왔다.',
    tags: ['소나기', '지렁이', '우산'],
    emoji: '🌧️'
  },
  {
    id: 'obs-4',
    title: '키가 엄청 큰 해바라기 🌻',
    date: '2023-10-10',
    weather: 'sunny',
    category: 'plant',
    description: '할머니 댁 마당에 있는 해바라기를 보았는데, 내 키보다 훨씬 더 크고 웅장했다! 노란 꽃잎이 마치 사자의 갈기 같았고, 가운데에는 까만 씨앗들이 촘촘하게 들어차 있었다.',
    tags: ['해바라기', '할머니댁', '키다리'],
    emoji: '🌻'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: '새싹 관찰자 (Lv.1)',
    description: '식물 관찰일지를 처음으로 작성했어요!',
    iconName: 'Sprout',
    achieved: true,
    requirement: '식물 일지 1개 쓰기',
    progress: 100,
    targetCount: 1,
    currentCount: 1
  },
  {
    id: 'badge-2',
    title: '식물 박사 (Lv.2)',
    description: '초록초록 식물들과 친해지는 중이에요!',
    iconName: 'Flower',
    achieved: false,
    requirement: '식물 일지 3개 쓰기',
    progress: 66,
    targetCount: 3,
    currentCount: 2
  },
  {
    id: 'badge-3',
    title: '파브르의 후예 (Lv.1)',
    description: '작은 곤충 친구들을 자세히 관찰해요!',
    iconName: 'Bug',
    achieved: true,
    requirement: '곤충 일지 1개 쓰기',
    progress: 100,
    targetCount: 1,
    currentCount: 1
  },
  {
    id: 'badge-4',
    title: '꼬마 기상캐스터 (Lv.1)',
    description: '날씨의 변화를 매일매일 기록해요!',
    iconName: 'CloudSun',
    achieved: true,
    requirement: '날씨 일지 1개 쓰기',
    progress: 100,
    targetCount: 1,
    currentCount: 1
  },
  {
    id: 'badge-5',
    title: '열정 관찰왕 (Lv.1)',
    description: '꾸준히 관찰일지를 채워나가요!',
    iconName: 'Award',
    achieved: false,
    requirement: '일지 총 5개 쓰기',
    progress: 80,
    targetCount: 5,
    currentCount: 4
  },
  {
    id: 'badge-6',
    title: '꼬마 화가 (Lv.1)',
    description: '일지에 손그림을 그려서 꾸몄어요!',
    iconName: 'Palette',
    achieved: true,
    requirement: '손그림 포함 일지 1개 쓰기',
    progress: 100,
    targetCount: 1,
    currentCount: 1
  }
];
