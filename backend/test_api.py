import requests

url = "http://localhost:8000/api/auth/register"
payload = {
    "whatsapp": "(11) 99999-9999",
    "nome": "Teste",
    "aceitaNotificacoes": False
}
response = requests.post(url, json=payload)
print("Register Status Code:", response.status_code)
print("Register Response:", response.text)

url_login = "http://localhost:8000/api/auth/login"
payload_login = {
    "whatsapp": "(11) 99999-9999"
}
response_login = requests.post(url_login, json=payload_login)
print("Login Status Code:", response_login.status_code)
print("Login Response:", response_login.text)
