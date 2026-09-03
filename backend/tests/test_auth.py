def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "forensics_analyst@example.com",
            "password": "SecurePassword123!",
            "full_name": "Dr. Forensic Analyst",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "forensics_analyst@example.com"
    assert data["full_name"] == "Dr. Forensic Analyst"
    assert data["role"] == "user"
    assert data["is_active"] is True
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_email_fails(client):
    user_payload = {
        "email": "analyst@example.com",
        "password": "SecurePassword123!",
        "full_name": "Analyst One",
    }
    res1 = client.post("/api/v1/auth/register", json=user_payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=user_payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "MySecretPassword!2026",
            "full_name": "Test User",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "MySecretPassword!2026",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_fails(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "MySecretPassword!2026",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_me_authenticated(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile@example.com",
            "password": "Password123!",
            "full_name": "Profile Owner",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "profile@example.com", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]

    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "profile@example.com"
    assert me_data["full_name"] == "Profile Owner"


def test_get_me_unauthorized_fails(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
