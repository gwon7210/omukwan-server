import { DataSource } from 'typeorm';
import { Omukwan } from '../entities/omukwan.entity';

export const createOmukwanSeed = async (dataSource: DataSource) => {
  const omukwanRepository = dataSource.getRepository(Omukwan);

  const omukwanData = [
    {
      date: new Date('2025-07-24'),
      verseRange: '창세기 1장 1~10절',
      verseTitle: '태초에 하나님이',
      fullVerse: `1 태초에 하나님이 천지를 창조하시니라.
2 땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라.
3 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고
4 빛이 하나님이 보시기에 좋았더라 하나님이 빛과 어둠을 나누사
5 하나님이 빛을 낮이라 부르시고 어둠을 밤이라 부르시니라 저녁이 되고 아침이 되니 이는 첫째 날이니라.
6 하나님이 이르시되 물 가운데 궁창이 있어 물과 물로 나뉘라 하시고
7 하나님이 궁창을 만드사 궁창 아래의 물과 궁창 위의 물로 나뉘게 하시니 그대로 되니라.
8 하나님이 궁창을 하늘이라 부르시니라 저녁이 되고 아침이 되니 이는 둘째 날이니라.
9 하나님이 이르시되 천하의 물이 한 곳으로 모이고 뭍이 드러나라 하시니 그대로 되니라.
10 하나님이 뭍을 땅이라 부르시고 모인 물을 바다라 부르시니라 하나님이 보시기에 좋았더라.`,
    },
    {
      date: new Date('2025-07-23'),
      verseRange: '시편 23편 1~6절',
      verseTitle: '여호와는 나의 목자시니',
      fullVerse: `1 여호와는 나의 목자시니 내게 부족함이 없으리로다.
2 그가 나를 푸른 풀밭에 누이시며 쉴 만한 물가로 인도하시는도다.
3 내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다.
4 내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라 주의 지팡이와 막대기가 나를 안위하시나이다.
5 주께서 내 원수의 목전에서 내게 상을 차려 주시고 기름으로 내 머리에 바르셨으니 내 잔이 넘치나이다.
6 내 평생에 선하심과 인자하심이 반드시 나를 따르리니 내가 여호와의 집에 영원히 거하리로다.`,
    },
    {
      date: new Date('2025-07-22'),
      verseRange: '요한복음 3장 16~17절',
      verseTitle: '하나님이 세상을 이처럼 사랑하사',
      fullVerse: `16 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라.
17 하나님이 그 아들을 세상에 보내신 것은 세상을 심판하려 하심이 아니요 그로 말미암아 세상이 구원을 받게 하려 하심이라.`,
    },
  ];

  for (const data of omukwanData) {
    const newOmukwan = omukwanRepository.create(data);
    await omukwanRepository.save(newOmukwan);
  }
}; 