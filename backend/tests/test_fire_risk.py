from backend.app.services.fire_risk import compute_fire_risk


def test_low():
    r = compute_fire_risk(temp=18, humidity=60, wind=2)
    assert r.level == "Low"


def test_moderate():
    r = compute_fire_risk(temp=22, humidity=60, wind=2)  # +1
    assert r.level == "Moderate"


def test_high():
    # temp +2, humidity +1, wind +1 => 4
    r = compute_fire_risk(temp=26, humidity=45, wind=5)
    assert r.level == "High"


def test_very_high():
    # temp +2, humidity +2, wind +1 => 5
    r = compute_fire_risk(temp=27, humidity=30, wind=5)
    assert r.level == "Very High"


def test_extreme():
    # temp +3, humidity +3, wind +3 => 9
    r = compute_fire_risk(temp=32, humidity=10, wind=20)
    assert r.level == "Extreme"
