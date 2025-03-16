# utils/recommendation.py

def generate_recommendation(current_glucose, hypo_prob, hyper_prob, time_to_hypo, time_to_hyper):
    """Generate a recommendation based on the prediction results"""

    if current_glucose < 70:
        return "URGENT: Current glucose level is low. Consume 15-20g of fast-acting carbohydrates immediately."

    if current_glucose > 180:
        return "Your glucose is currently high. Check ketones if over 240 mg/dL. Consider taking correction insulin as advised by your healthcare provider."

    if hypo_prob > 0.7 and time_to_hypo < 30:
        return f"WARNING: High risk of hypoglycemia in approximately {int(time_to_hypo)} minutes. Consider consuming 15g of carbohydrates to prevent low blood sugar."

    if hyper_prob > 0.7 and time_to_hyper < 30:
        return f"ALERT: High risk of hyperglycemia in approximately {int(time_to_hyper)} minutes. Check for missed insulin doses or recent high-carb meals."

    if hypo_prob > 0.3:
        return f"Moderate risk of low blood sugar. Monitor closely over the next {int(time_to_hypo)} minutes."

    if hyper_prob > 0.3:
        return f"Moderate risk of high blood sugar. Be mindful of carb intake and insulin timing."

    return "Your glucose levels appear stable. Continue with regular monitoring."