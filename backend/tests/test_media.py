import io
from PIL import Image


def create_test_image_bytes() -> bytes:
    img = Image.new("RGB", (100, 50), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_upload_image_success(client):
    # Register & Login user
    client.post(
        "/api/v1/auth/register",
        json={"email": "analyst@media.ai", "password": "Password123!"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "analyst@media.ai", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/media/upload",
        files={"file": ("sample_chart.png", img_bytes, "image/png")},
        headers=headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "sample_chart.png"
    assert data["media_type"] == "image"
    assert data["mime_type"] == "image/png"
    assert len(data["sha256_hash"]) == 64
    assert data["metadata_json"]["width"] == 100
    assert data["metadata_json"]["height"] == 50
    assert data["metadata_json"]["aspect_ratio"] == 2.0


def test_upload_text_file_success(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "text_analyst@media.ai", "password": "Password123!"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "text_analyst@media.ai", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    text_content = b"Deepfake forensic text evidence statement.\nLine two statement."
    response = client.post(
        "/api/v1/media/upload",
        files={"file": ("statement.txt", text_content, "text/plain")},
        headers=headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["media_type"] == "text"
    assert data["metadata_json"]["line_count"] == 2
    assert data["metadata_json"]["word_count"] > 0


def test_upload_unsupported_format_fails(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "user@media.ai", "password": "Password123!"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "user@media.ai", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/media/upload",
        files={"file": ("executable.exe", b"\x00\x01\x02", "application/x-msdownload")},
        headers=headers,
    )

    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_get_media_by_id_and_list(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "list_user@media.ai", "password": "Password123!"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "list_user@media.ai", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    img_bytes = create_test_image_bytes()
    upload_res = client.post(
        "/api/v1/media/upload",
        files={"file": ("test_list.png", img_bytes, "image/png")},
        headers=headers,
    )
    media_id = upload_res.json()["id"]

    # Test GET /{id}
    get_res = client.get(f"/api/v1/media/{media_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == media_id

    # Test GET list
    list_res = client.get("/api/v1/media", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
    assert list_res.json()[0]["id"] == media_id
