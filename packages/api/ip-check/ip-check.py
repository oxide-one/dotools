import csv
def load_csv() -> list:
    iplist = []
    with open('google.csv', newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in reader:
            ip_info = {
                "ipaddr": row[0],
                "country": row[1],
                "country-region": row[2],
                "city": row[3],
                "postcode": row[4]
            }
            iplist.append(ip_info)
    return iplist

def main(args):
      iplist = load_csv()
      name = args.get("ip_addresses")
      print(ip_addresses)
      return {"ip_addresses": greeting}

print(load_csv())