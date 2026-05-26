import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FormField } from '@/components/FormField';
import { FormMessage } from '@/components/FormMessage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TimeoutError } from '@/utils/withTimeout';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ erro?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const erroParam =
    params.erro === 'sem_cadastro'
      ? 'Sessão ativa, mas nenhum cadastro de contador vinculado foi encontrado.'
      : null;

  const handleLogin = async () => {
    setFeedback(null);

    if (!email.trim() || !password) {
      const msg = 'Informe e-mail e senha.';
      setFeedback({ type: 'error', message: msg });
      return;
    }

    try {
      setLoading(true);
      const vinculos = await signIn(email, password);
      if (!vinculos.length) {
        setFeedback({
          type: 'error',
          message: 'Nenhum cadastro de contador ativo vinculado a este e-mail.',
        });
        return;
      }
      router.replace('/(app)/notas');
    } catch (e) {
      const msg =
        e instanceof TimeoutError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Não foi possível entrar.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Bem-vindo de volta</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Consulta de NF-e para contadores
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {erroParam ? <FormMessage type="error" message={erroParam} /> : null}
          {feedback ? <FormMessage type={feedback.type} message={feedback.message} /> : null}

          <FormField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="seu@email.com"
            editable={!loading}
            onSubmitEditing={() => void handleLogin()}
          />

          <FormField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            placeholder="••••••••"
            editable={!loading}
            onSubmitEditing={() => void handleLogin()}
          />

          <PrimaryButton
            label={loading ? 'Entrando…' : 'Entrar'}
            onPress={() => void handleLogin()}
            loading={loading}
          />

          <PrimaryButton
            label="Primeiro acesso"
            onPress={() => router.push('/primeiro-acesso')}
            variant="outline"
            style={styles.primeiroBtn}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  primeiroBtn: {
    marginTop: 10,
  },
});
