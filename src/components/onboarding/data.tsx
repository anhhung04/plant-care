import {AnimationObject} from 'lottie-react-native';

export interface OnboardingData {
  id: number;
  animation: AnimationObject;
  text: string;
  textColor: string;
  backgroundColor: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('@/assets/animation/farm.json'),
    text: 'Quản Lý Nông Trại Của Bạn Một Cách Dễ Dàng',
    textColor: '#77a37a',
    backgroundColor: '#ffffff',
  },
  {
    id: 2,
    animation: require('@/assets/animation/chicken.json'),
    text: 'Dễ dàng sử dụng, trực quan và hiệu quả',
    textColor: '#e48142',
    backgroundColor: '#ffffff',
  },
  {
    id: 3,
    animation: require('@/assets/animation/auto.json'),
    text: 'Tự động, trực tuyến 24/7',
    textColor: '#587e60',
    backgroundColor: '#ffffff',
  },
];

export default data;