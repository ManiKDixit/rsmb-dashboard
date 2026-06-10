import requests
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url, expected_keys=None):
    try:
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            if expected_keys:
                for key in expected_keys:
                    if key not in str(data):
                        print(f"  ⚠️  Missing expected key: {key}")
                        return False
            print(f"✅ {name}: OK")
            return True
        else:
            print(f"❌ {name}: HTTP {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ {name}: {e}")
        return False

def main():
    print("\n RSMB Analytics API Tests \n")
    
    results = []
    
    
    results.append(test_endpoint("Health", f"{BASE_URL}/health", ["status", "data_loaded"]))
    results.append(test_endpoint("Platforms Summary", f"{BASE_URL}/platforms", ["platforms"]))
    results.append(test_endpoint("Campaigns", f"{BASE_URL}/campaigns", ["campaigns", "total_count"]))
    results.append(test_endpoint("Metrics Summary", f"{BASE_URL}/metrics/summary", ["total_spend", "avg_roas"]))
    results.append(test_endpoint("Metrics Trends", f"{BASE_URL}/metrics/trends", ["data", "metric"]))
    
    
    results.append(test_endpoint("Compare", f"{BASE_URL}/api/compare?metric=ROAS&group_by=platform", ["labels", "values"]))
    results.append(test_endpoint("Insights", f"{BASE_URL}/api/insights", ["best_roas_platform"]))
    results.append(test_endpoint("Executive Summary", f"{BASE_URL}/api/executive-summary", ["findings"]))
    
    print(f"\nResults: {sum(results)}/{len(results)} passed\n")
    
    return 0 if all(results) else 1

if __name__ == "__main__":
    sys.exit(main())
