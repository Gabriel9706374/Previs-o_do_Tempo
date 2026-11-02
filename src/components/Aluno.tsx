import { View, Text } from 'react-native';

type Props = {
  nome: string;
  idade: number;
  turma: string;
  nota1: number;
  nota2: number;
};

export default function Aluno(props: Props) {
  const media = (props.nota1 + props.nota2) / 2;

  return (
    <View>
      <Text>Nome: {props.nome}</Text>
      <Text>Idade: {props.idade}</Text>
      <Text>Turma: {props.turma}</Text>
      <Text>Nota 1: {props.nota1}</Text>
      <Text>Nota 2: {props.nota2}</Text>
      <Text>Média: {media}</Text>
    </View>
  );
}