import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type ClimaAtual = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
};

type PrevisaoDiaria = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

type ResultadoClima = {
  nome: string;
  pais: string;
  atual: ClimaAtual;
  diaria: PrevisaoDiaria;
};

function descricaoTempo(codigo: number) {
  if (codigo === 0) return 'Céu limpo';
  if (codigo === 1) return 'Predominantemente limpo';
  if (codigo === 2) return 'Parcialmente nublado';
  if (codigo === 3) return 'Nublado';
  if ([45, 48].includes(codigo)) return 'Neblina';
  if ([51, 53, 55, 56, 57].includes(codigo)) return 'Garoa';
  if ([61, 63, 65, 66, 67].includes(codigo)) return 'Chuva';
  if ([71, 73, 75, 77].includes(codigo)) return 'Neve';
  if ([80, 81, 82].includes(codigo)) return 'Pancadas de chuva';
  if ([85, 86].includes(codigo)) return 'Pancadas de neve';
  if ([95, 96, 99].includes(codigo)) return 'Trovoadas';
  return 'Condição desconhecida';
}

function nomeDia(data: string) {
  const dia = new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
  return dia.charAt(0).toUpperCase() + dia.slice(1);
}

export default function Index() {
  const [cidade, setCidade] = useState('');
  const [clima, setClima] = useState<ResultadoClima | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function consultarClima() {
    const busca = cidade.trim();

    if (!busca) {
      setErro('Digite o nome de uma cidade.');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      setClima(null);

      const respostaCidade = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=1&language=pt&format=json`
      );

      if (!respostaCidade.ok) {
        throw new Error('Não foi possível procurar essa cidade.');
      }

      const dadosCidade = await respostaCidade.json();
      const local = dadosCidade.results?.[0];

      if (!local) {
        throw new Error('Cidade não encontrada. Confira o nome e tente novamente.');
      }

      const urlClima =
        `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}` +
        `&longitude=${local.longitude}` +
        '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m' +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
        '&timezone=auto&forecast_days=5';

      const respostaClima = await fetch(urlClima);

      if (!respostaClima.ok) {
        throw new Error('Não foi possível consultar a previsão do tempo.');
      }

      const dadosClima = await respostaClima.json();

      setClima({
        nome: local.name,
        pais: local.country ?? '',
        atual: dadosClima.current,
        diaria: dadosClima.daily,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Ocorreu um erro na consulta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Consulta de Clima</Text>
      <Text style={styles.subtitulo}>
        Pesquise uma cidade e veja as condições do tempo.
      </Text>

      <View style={styles.caixaBusca}>
        <TextInput
          style={styles.campo}
          value={cidade}
          onChangeText={setCidade}
          placeholder="Ex.: Sapucaia do Sul"
          placeholderTextColor="#8492a6"
          returnKeyType="search"
          onSubmitEditing={consultarClima}
        />
        <Pressable
          style={({ pressed }) => [
            styles.botao,
            pressed && styles.botaoPressionado,
            carregando && styles.botaoDesativado,
          ]}
          onPress={consultarClima}
          disabled={carregando}
        >
          <Text style={styles.textoBotao}>Consultar</Text>
        </Pressable>
      </View>

      {carregando && (
        <View style={styles.mensagem}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.textoSecundario}>Buscando informações...</Text>
        </View>
      )}

      {!!erro && <Text style={styles.erro}>{erro}</Text>}

      {clima && (
        <>
          <View style={styles.cartaoPrincipal}>
            <Text style={styles.local}>
              {clima.nome}{clima.pais ? `, ${clima.pais}` : ''}
            </Text>
            <Text style={styles.temperatura}>
              {Math.round(clima.atual.temperature_2m)}°C
            </Text>
            <Text style={styles.condicao}>
              {descricaoTempo(clima.atual.weather_code)}
            </Text>
            <Text style={styles.sensacao}>
              Sensação térmica: {Math.round(clima.atual.apparent_temperature)}°C
            </Text>
          </View>

          <Text style={styles.tituloSecao}>Condições atuais</Text>
          <View style={styles.grade}>
            <View style={styles.cartaoInfo}>
              <Text style={styles.rotulo}>Umidade</Text>
              <Text style={styles.valor}>{clima.atual.relative_humidity_2m}%</Text>
            </View>
            <View style={styles.cartaoInfo}>
              <Text style={styles.rotulo}>Vento</Text>
              <Text style={styles.valor}>{clima.atual.wind_speed_10m} km/h</Text>
            </View>
            <View style={styles.cartaoInfo}>
              <Text style={styles.rotulo}>Chuva atual</Text>
              <Text style={styles.valor}>{clima.atual.precipitation} mm</Text>
            </View>
          </View>

          <Text style={styles.tituloSecao}>Previsão para 5 dias</Text>
          {clima.diaria.time.map((data, indice) => (
            <View style={styles.linhaPrevisao} key={data}>
              <View style={styles.diaColuna}>
                <Text style={styles.dia}>{nomeDia(data)}</Text>
                <Text style={styles.descricaoDia}>
                  {descricaoTempo(clima.diaria.weather_code[indice])}
                </Text>
              </View>
              <Text style={styles.temperaturasDia}>
                {Math.round(clima.diaria.temperature_2m_max[indice])}° /{' '}
                {Math.round(clima.diaria.temperature_2m_min[indice])}°
              </Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.rodape}>
        Dados meteorológicos: Open-Meteo
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#eef4ff',
  },
  conteudo: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  titulo: {
    color: '#14213d',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#52627a',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 22,
  },
  caixaBusca: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  campo: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#14213d',
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  botaoPressionado: {
    opacity: 0.75,
  },
  botaoDesativado: {
    opacity: 0.5,
  },
  textoBotao: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mensagem: {
    alignItems: 'center',
    padding: 24,
    gap: 10,
  },
  textoSecundario: {
    color: '#52627a',
  },
  erro: {
    color: '#b42318',
    backgroundColor: '#fee4e2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  cartaoPrincipal: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginTop: 8,
  },
  local: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  temperatura: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: 'bold',
    marginTop: 8,
  },
  condicao: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  sensacao: {
    color: '#dbeafe',
    marginTop: 8,
  },
  tituloSecao: {
    color: '#14213d',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cartaoInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexGrow: 1,
    minWidth: '30%',
  },
  rotulo: {
    color: '#64748b',
    fontSize: 13,
  },
  valor: {
    color: '#14213d',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  linhaPrevisao: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diaColuna: {
    flex: 1,
  },
  dia: {
    color: '#14213d',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  descricaoDia: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 3,
  },
  temperaturasDia: {
    color: '#14213d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rodape: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});