import base64
import os
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

# Generate a new ECDSA private key for P-256
private_key = ec.generate_private_key(ec.SECP256R1())

# Extract the private key as a 32-byte string
private_numbers = private_key.private_numbers()
private_bytes = private_numbers.private_value.to_bytes(32, 'big')

# Extract the public key and serialize it (uncompressed format starts with 0x04)
public_key = private_key.public_key()
public_bytes = public_key.public_bytes(
    encoding=serialization.Encoding.X962,
    format=serialization.PublicFormat.UncompressedPoint
)

# Encode keys to URL-safe Base64 without padding
vapid_private_key = base64.urlsafe_b64encode(private_bytes).decode('utf-8').rstrip('=')
vapid_public_key = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')

# Append to .env
env_file = ".env"
with open(env_file, "a") as f:
    f.write(f"\nVAPID_PUBLIC_KEY={vapid_public_key}\n")
    f.write(f"VAPID_PRIVATE_KEY={vapid_private_key}\n")
    f.write(f"VAPID_CLAIM_EMAIL=mailto:contato@sweetag.com.br\n")

# Print for info
print("VAPID Keys generated and appended to .env")
print("Public Key:", vapid_public_key)
print("Private Key:", vapid_private_key)

