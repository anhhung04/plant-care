import joblib
import pandas as pd
import os

model = joblib.load(os.path.dirname(__file__) + "/models/model_rf.pkl")
scaler = joblib.load(os.path.dirname(__file__) + "/models/scaler.pkl")
column_means = joblib.load(os.path.dirname(__file__) + "/models/column_means.pkl")
column_order = joblib.load(os.path.dirname(__file__) + "/models/column_order.pkl")

def predict_led_on(partial_input: dict) -> str:
    full_input = column_means.copy()
    full_input.update(partial_input)

    ordered_input = full_input[column_order]

    input_scaled = scaler.transform(pd.DataFrame([ordered_input]))
    prediction = model.predict(input_scaled)[0]

    return "on" if prediction == 1 else "off"

if __name__ == "__main__":
    input_data = {
        "Light_Intensity": 500,
        "Temperature": 21.5,
        "Humidity": 67,
        "Minute_Of_Day": 510  # 8:30 sáng
    }

    result = predict_led_on(input_data)
    print(f"Kết quả dự đoán LED: {result}")
