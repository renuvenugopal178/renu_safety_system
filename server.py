from flask import Flask, request, render_template, jsonify
import requests

app = Flask(__name__)

# Home route (serves the frontend)
@app.route("/")
def index():
    return render_template("index.html")

# Alert route (sends email via MailBluster)
@app.route("/alert", methods=["POST"])
def send_alert():
    data = request.json
    distress_message = data.get("message", "")

    # Replace with your MailBluster API Key and List ID
    MAILBLUSTER_API_KEY = "d436d2cc-e926-4136-83db-2e724b7626a3"
    LIST_ID = "renuhelp"

    url = f"https://api.mailbluster.com/api/lists/{LIST_ID}/subscribers"

    payload = {
        "name": "Distress Alert",
        "email": "recipient@example.com",
        "status": "subscribed",
        "custom_fields": {"message": distress_message}
    }

    headers = {
        "Authorization": f"Bearer {MAILBLUSTER_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 201:
        return jsonify({"status": "📩 Email sent via MailBluster!"})
    else:
        return jsonify({"status": "❌ Error sending email!"}), 500


if __name__ == "__main__":
    app.run(debug=True)
