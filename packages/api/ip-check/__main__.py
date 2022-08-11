import csv
from http import HTTPStatus
from ipaddress import ip_network, ip_address

# ipaddress
# ipaddresses
# ipnetwork
# ipnetworks

def make_ip(ipaddress, is_private:bool=False, is_do:bool=False, ipnetwork:dict={}):
    if is_do:
        in_range = ipnetwork['ipaddress']
        country = ipnetwork['country']
        city = ipnetwork['city']
        postcode = ipnetwork['postcode']
    else:
        in_range, country, city, postcode = "","","",""
    
    return {
        "ip_address": str(ipaddress),
        "is_private": is_private,
        "is_do": is_do,
        "in_range": str(in_range),
        "country": country,
        "city": city,
        "postcode": postcode
    }

def load_csv() -> list:
    ipnetworks = []
    with open('google.csv', newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in reader:
            ipinfo = {
                "ipaddress":  ip_network(row[0]),
                "country": row[1],
                "country-region": row[2],
                "city": row[3],
                "postcode": row[4]
            }
            ipnetworks.append(ipinfo)
    return ipnetworks

def match_ips(ipaddresses: list, ipnetworks: list) -> list:
    """
    {
        ip_address: ip_address,
        is_private: bool,
        is_do: bool,
        in_range: ip_range
        country: str,
        city: str,
        postcode: str

    }
    """
    data = []
    # Iterate over every IP address in the list
    for ipaddress_raw in ipaddresses:
        try:
            ipaddress = ip_address(ipaddress_raw)
        except ValueError as e:
            continue
        if ipaddress.is_private:
            data.append(make_ip(str(ipaddress), is_private=True))
            continue
        is_do,matching_ipnetwork = find_range(ipaddress, ipnetworks)
        data.append(make_ip(ipaddress,is_do=is_do,ipnetwork=matching_ipnetwork))
    print(data)
    return data   

def find_range(ipaddress, ipnetworks: list):
    # Keeping the type for ip_address unbound here
    matching_ipnetworks = [ipnetwork for ipnetwork in ipnetworks if ipaddress in ipnetwork['ipaddress']]
    if len(matching_ipnetworks) == 0:
        return False,None
    else:
        return True,matching_ipnetworks[0]

def main(args):
      ipnetworks = load_csv()
      ipaddresses = args.get("ipaddresses")
      print(args)
      return {
                "statusCode" : HTTPStatus.OK,
                "body" : {                    
                    "ipaddresses": match_ips(ipaddresses,ipnetworks)
                }
            }    

# if __name__=='__main__':
#     import json
#     print(json.dumps(main({
#         'ip_addresses': [
#             "10.0.0.1",
#             "10.0.0.2",
#             "10.0.0.3/24",
#             "207.154.234.246",
#             "test",
#             "1.2",
#             "104.248.30.121", "138.197.181.112", "142.93.98.30", "157.230.111.64", "157.230.19.101", "157.230.21.105", "157.230.29.144", "159.89.21.4", "159.89.3.43", "164.92.162.166",
#             "8.8.8.8"
#         ]
#     })))
