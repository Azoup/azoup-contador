import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

export default function PrimeiroAcessoScreen() {
  const { theme } = useTheme();
  const { primeiroAcesso } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success' | 'info';
    message: string;
  } | null>(null);

  const handleSubmit = async () => {
    setFeedback(null);

    if (!email.trim() || !novaSenha || !confirmar) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    if (novaSenha.length < 6) {
      setFeedback({
        type: 'error',
        message: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    if (novaSenha !== confirmar) {
      setFeedback({ type: 'error', message: 'A confirmação da senha não confere.' });
      return;
    }

    try {
      setLoading(true);
      await primeiroAcesso(email, novaSenha);
      setFeedback({
        type: 'success',
        message: 'Senha definida com sucesso! Redirecionando…',
      });
      setTimeout(() => {
        router.replace('/(app)/notas');
      }, 600);
    } catch (e) {
      const msg =
        e instanceof TimeoutError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Não foi possível concluir o cadastro.';
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
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>← Voltar ao login</Text>
        </Pressable>

        <Text style={[styles.title, { color: theme.text }]}>Primeiro acesso</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Informe o e-mail cadastrado e defina sua nova senha. O sistema verifica se ainda está
          com a senha padrão antes de permitir a alteração.
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {feedback ? (
            <FormMessage type={feedback.type} message={feedback.message} />
          ) : null}

          <FormField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="contador@escritorio.com.br"
            editable={!loading}
          />

          <FormField
            label="Nova senha"
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            editable={!loading}
          />

          <FormField
            label="Confirmar nova senha"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry
            autoComplete="new-password"
            placeholder="Repita a senha"
            editable={!loading}
            onSubmitEditing={handleSubmit}
          />

          <PrimaryButton
            label={loading ? 'Processando…' : 'Definir senha e entrar'}
            onPress={() => {
              void handleSubmit();
            }}
            loading={loading}
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
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  back: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
});
