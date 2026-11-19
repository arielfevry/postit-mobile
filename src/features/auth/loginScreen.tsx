import { Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  return (
    <View>
      <Text>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
      />

      <Pressable onPress={() => {}}>
        <Text>Log In</Text>
      </Pressable>

      <Pressable onPress={() => {}}>
        <Text>Create an Account</Text>
      </Pressable>
    </View>
  );
}