import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <FontAwesome name="user" size={40} color="#E91E8C" />
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.section}>
        <Pressable style={styles.menuItem}>
          <FontAwesome name="cog" size={18} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
          <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </Pressable>
        <Pressable style={styles.menuItem}>
          <FontAwesome name="info-circle" size={18} color="#666" />
          <Text style={styles.menuText}>About</Text>
          <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={18} color="#E91E8C" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', alignItems: 'center', paddingTop: 40 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  email: { fontSize: 14, color: '#888', marginBottom: 32 },
  section: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuText: { flex: 1, fontSize: 16, color: '#1a1a2e', marginLeft: 14 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E91E8C',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#E91E8C' },
});
