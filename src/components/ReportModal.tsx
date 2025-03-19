import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '@/assets/fonts/colors';

interface FeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSendFeedback: (feedback: string) => void;
}

const ReportModal: React.FC<FeedbackModalProps> = ({ 
  isVisible, 
  onClose, 
  onSendFeedback 
}) => {
  const [feedback, setFeedback] = useState<string>('');

  const handleSend = () => {
    if (feedback.trim()) {
      onSendFeedback(feedback);
      setFeedback('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Feather name="x-circle" size={34} color="rgb(206, 46, 46)" />
          </TouchableOpacity>

          {/* Modal Title */}
          <Text style={styles.modalTitle}>Báo cáo lỗi</Text>

          {/* Feedback Input */}
          <TextInput
            multiline
            mode='outlined'
            placeholder='Điền nội dung chi tiết lỗi'
            onChangeText={text => setFeedback(text)}
            value={feedback}
            style={styles.textInput}
            activeOutlineColor={colors.light}
            outlineStyle={{borderColor:colors.secondary , borderRadius:20}}
            numberOfLines={5}
            textAlignVertical="top"
            />

          {/* Send Button */}
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
          >
            <Feather name="send" color={colors.white} size={20}></Feather>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textInput: {
    width: '100%',
    height: 150,
    marginBottom: 20,
    backgroundColor: colors.white
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    borderRadius: 20,
    width: '80%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonText: {
    marginLeft: 5,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center'
  },
});

export default ReportModal;