import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { login, register } from "../../services/authServices";


export default function AuthScreen()
{
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const[message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
 
  async function doLogin()
  {
    setMessage("");
    setSuccessMessage("");

    if(!loginEmail.trim() || !loginPassword)
    {
      setMessage("Please fill in all fields");
      return;
    }

    try
    {
      setIsLoading(true);

      await login({email: loginEmail, password: loginPassword});

      setSuccessMessage("Login successful!");

      //add redirect to home page or dashboard here
    }
    catch (error)
    {
       error instanceof Error ? error.message : "Login failed."
    }
    finally
    {
      setIsLoading(false);
    }
  }

  async function doRegister()
  {
    setMessage("");
    setSuccessMessage("");

    if(!regEmail.trim() || !regPassword || !regName.trim())
    {
      setMessage("Please fill in all fields");
      return;
    }

    try
    {
      setIsLoading(true);

      await register({name: regName, email: regEmail, password: regPassword});

      setSuccessMessage("Registration successful!");
    }
    catch (error)
    {
      setMessage( error instanceof Error ? error.message: "Registration failed. Please try again.");
    }
    finally
    {
      setIsLoading(false);
    }
  }
  
  return (
  <View style={styles.container}>
    <Image
      source={require("../../../assets/images/cork.png")}
      style={styles.backgroundImage}
      resizeMode="repeat"
    />
    <View style={styles.card}>

      <Image
      source={require("../../../assets/images/note.png")}
      style={[styles.paperBackground, !isRegisterMode && styles.registerCard]}
      resizeMode="stretch"
      />

      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isRegisterMode ? "Welcome to PostIt!" : "Login to PostIt!"}
        </Text>

        {/* <Text style={styles.subtitle}>
          {isRegisterMode
            ? "NEW USER REGISTRATION"
            : "PLEASE LOG IN"}
        </Text> */}
      </View>

      {/*mode switch*/}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            !isRegisterMode && styles.activeTab
          ]}
          onPress={() => {
            setIsRegisterMode(false);
            setMessage("");
            setSuccessMessage("");
          }}
        >
          <Text style={[
            styles.tabText,
            !isRegisterMode && styles.activeTabText
          ]}>
            Login
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            isRegisterMode && styles.activeTab
          ]}
          onPress={() => {
            setIsRegisterMode(true);
            setMessage("");
            setSuccessMessage("");
          }}
        >
          <Text style={[
            styles.tabText,
            isRegisterMode && styles.activeTabText
          ]}>
            Register
          </Text>
        </Pressable>
      </View>
          {!isRegisterMode && (
        <View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={loginEmail}
            onChangeText={setLoginEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
            autoComplete="current-password"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={doLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonTextBlack}>
              {isLoading ? "Logging in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* <Button
            title={isLoading ? "Logging in..." : "Sign In"}
            onPress={doLogin}
            disabled={isLoading}
            color="#ffc107"
            
          /> */}

      </View>
      )}

      {isRegisterMode && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={regName}
            onChangeText={setRegName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={regEmail}
            onChangeText={setRegEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={regPassword}
            onChangeText={setRegPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#198754", borderRadius: 8 }]}
            onPress={doRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonTextWhite}>
              {isLoading ? "Registering..." : "Register"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Feedback */}
      {message !== "" && (
        <Text style={styles.errorMessage}>{message}</Text>
      )}

      {successMessage !== "" && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}
    </View>
  </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#b78656',
  },

  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  paperBackground: {
    position: 'absolute',
    left: '-10%',
    top: '-20%',
    height: '130%',
    width: '120%',
  },

  cardContent: {
    paddingTop: 26,
    paddingHorizontal: 20,
    paddingBottom: 20,
    
  },

  card: {
   width: '90%',
    maxWidth: 420,
    minHeight: 400,
    position: 'relative',
    
  },

  registerCard: {
    height: 490,
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    letterSpacing: 1,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },

  activeTab: {
    backgroundColor: '#e2f383',
  },

  tabText: {
    fontWeight: '600',
    color: '#0d6efd',
  },

  activeTabText: {
    color: '#000000',
  },

  button: {
    backgroundColor: '#ffc107',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  buttonTextBlack: {
    color: '#000000', // Title color
    fontSize: 18,
    //fontFamily: 'PatrickHand-Regular', // Title font family
  },

  buttonTextWhite: {
    color: '#ffffff', // Title color
    fontSize: 18,
    //fontFamily: 'PatrickHand-Regular', // Title font family
  },

  input: {
  borderWidth: 1,
  borderColor: "#dddddd",
  borderRadius: 8,
  padding: 14,
  marginBottom: 16,
  fontSize: 16,
  },

  errorMessage: {
    color: "#dc2626",
    textAlign: "center",
    marginTop: 16,
  },
  
  successMessage: {
    color: "#16a34a",
    textAlign: "center",
    marginTop: 16,
  },
});
