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
    print("Got to here")
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
    print(f"IP addresses from query (match_ips): {ipaddresses}, type {type(ipaddresses)}")
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
      ipaddresses = args.get("ipaddresses").split(',')
      print(f"IP addresses from query: {ipaddresses}")
      retvar = match_ips(ipaddresses,ipnetworks)
      print(retvar)
      return {
                "statusCode" : HTTPStatus.OK,
                "body" : {                    
                    "ipaddresses": retvar
                }
            }    
