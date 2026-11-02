import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Explore() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Sobre o projeto</Text>
      <View style={styles.cartao}>
        <Text style={styles.texto}>
          Este aplicativo consulta dados meteorológicos usando os serviços gratuitos da Open-Meteo.
        </Text>
        <Text style={styles.texto}>
          Primeiro, procura a cidade. Depois, usa as coordenadas encontradas para buscar as condições atuais e a previsão para cinco dias.
        </Text>
        <Text style={styles.texto}>
          Os dados são recebidos em JSON e apresentados em uma lista.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#eef4ff' },
  conteudo: { padding: 20, paddingTop: 28 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#14213d', marginBottom: 16 },
  cartao: { backgroundColor: '#ffffff', padding: 18, borderRadius: 16, gap: 14 },
  texto: { fontSize: 16, color: '#334155', lineHeight: 24 },
});
