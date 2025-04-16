import { StyleSheet } from "react-native";
import { colors } from "../../assets/fonts/colors";
import { fonts } from "@/assets/fonts/font";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f1f7f1'
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.gray,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  card:{
     elevation: 10,
     marginBottom:16,
     borderRadius: 18,
     backgroundColor: colors.white,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 16,
      },
    overlayButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 16,
    },
      title: {
        color: colors.black,
        fontSize: 24,
        fontFamily: fonts.Bold,
        fontWeight: 'bold',
      },
      subtitle: {
        color: colors.nblack,
        fontSize: 14,
        marginTop: 4,
      },
      reButton:{
        borderBlockColor: 'orange',
      },
  textContainer: {
    marginVertical: 20,
  },
  headingText: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: fonts.Bold,
    fontWeight: 'bold',
  },
  subHeadingText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    marginTop: 10,
  },
  deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 6
      },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
  },
  forgotPasswordText: {
    textAlign: "right",
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    marginVertical: 10,
  },
  loginButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
  },
  DetailText: {
    flex: 1,
    color: colors.nblack,
    fontSize: 18,
    fontFamily: fonts.Regular,
    paddingLeft: 10,
  },
  DetailValue: {
    color: colors.nblack,
    fontSize: 18,
    fontFamily: fonts.SemiBold,
    right:0,
    paddingRight: 10,
  },
  continueText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
    fontFamily: fonts.Regular,
    color: colors.primary,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 5,
  },
  accountText: {
    color: colors.primary,
    fontFamily: fonts.Regular,
  },
  signupText: {
    color: colors.primary,
    fontFamily: fonts.Bold,
  },
  resendButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  resendText: {
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    fontSize: 14,
  },
  resendTextDisabled: {
    color: colors.secondary,
    opacity: 0.6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00', // bright green
    marginLeft: 5,
  },
});

export default styles;