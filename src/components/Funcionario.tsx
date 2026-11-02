import { View, Text } from 'react-native';

type Props = {
  nome: string;
  idade: number;
  setor: string;
};

export default function Funcionario(props: Props) {
  return (
    <View>
      <Text>Nome: {props.nome}</Text>
      <Text>Idade: {props.idade}</Text>
      <Text>Setor: {props.setor}</Text>
    </View>
  );
}