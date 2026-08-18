<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Get parameters
$dateStr = isset($_GET['date']) ? $_GET['date'] : null;
$staffName = isset($_GET['staffName']) ? $_GET['staffName'] : null;

if (!$dateStr || !$staffName) {
    echo json_encode([]);
    exit;
}

// Map staff names to Calendar IDs
$calendars = [
    'Ailyn' => '2a1a8b53eb4e0896c7e717689677d776fc03e9559b2406c81e34689d4e3e9fdf@group.calendar.google.com',
    'Arely' => '1468b98a1bf3fe6cb42b42724d855262a389cd402811bb15a7d2abbc77fd2ffd@group.calendar.google.com',
    'Jazmin' => 'aa433317bf9b7f844e6e09a2b45369d3e63f66f91832d06894f6a228dcaecffc@group.calendar.google.com',
    'Bere' => 'af5ab4ac8f7c0cb8a18dedda14cbaa3261247bde24733aba37d2dda6486345ce@group.calendar.google.com'
];

if (!isset($calendars[$staffName])) {
    echo json_encode([]);
    exit;
}
$calendar_id = $calendars[$staffName];

// Service Account Details
$client_email = "firebase-adminsdk-fbsvc@cuu--studio.iam.gserviceaccount.com";
$private_key = "-----BEGIN PRIVATE KEY-----\n" .
"MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDVKfDC1fzXtDfN\n" .
"vw8M5/tPm6stytnITg/RZ92VRDd0Oh9WWSyADu/twwt3sSyX9mozWiffIwTfkK19\n" .
"JuOp4ciaPaI762qxlUEtsbMFZCXs2yIfr1XsrqtdNKT6OSpTS1JZ1ONHoTa1VDF8\n" .
"P2gfbywxShy+rqhuHUUWZXAfj5tH+ZBffmOLkO17J9vfG6Cx2Z+MCS4YaQPULYWx\n" .
"dZv50oEyQxc+FW7dfTgS4U36e7MPhkMHk4T03FvUIQvM6bR8AUQa1ztf2Q6eqRgu\n" .
"WvDExd+BzUZMVClhEDcnSVXp4CgAknH50KUXHVfkIHcMctL5s5l/rm1DIax/WWC6\n" .
"7pTfZ7wzAgMBAAECggEAJ4qhI7NINMc0dtETPKSnxKuuxE7VuUdpvcGTpAXEd6X0\n" .
"fDMMgzDCJwvAS9Ks3/+Q0bfOn6DCXapb1FRrdO7yJFJ8jrrrzsdOEOjeuYhLVLWN\n" .
"je0bdk0scpy6YcRK6qqVOx63jmkEWfylNVQZv4MC4p3J2UFS8yIw16e3ddNQzbfR\n" .
"5yFzofR+YUe4e09PMqlEnwiDl12M32cVAJHpmRMbkyxa9FZ1/CHW1gANpFPDdmPu\n" .
"zYbQbQZ5N1E9kQVVRTfS9cWFGkxTUFhy29EAq2L7wpJJuLWtUzy4Pu17j6SD2edf\n" .
"VyrhbqPoZKGmVm5jAKHpGyB/utkD0o8dkALXLnbh4QKBgQDzkJJ2nNSpDmHIai/l\n" .
"ybz7W5HXnMjb+CSsdAOQTuk2WCK4bx26p4PWfuZOb169qhX+cZYg2zC4ZBG/utsn\n" .
"A3SCkEQuakaa0jBlcqXuIHeVx4MWR3POi5ScBU78djnt8VetYleHqM7w8WTNIHRi\n" .
"h0eWUGsIlITL7rM6GyIYPtfQIwKBgQDgDAYgXkasXv/yq0aFUKzcR/Fa0sftzdew\n" .
"6+60Ue1XxpCwqq0cPrznXJ8sLZDSu1idrADYcrnjteuFuKsh6r6TOPx9ZA2w35Nv\n" .
"9AoobrMsRvR/QnuymtCV0AFqIH2IXV7VuK04b+ZFPopTb4bihE1GBXjHJCRT/fDB\n" .
"lgpfKS8csQKBgAvw4Y1ZIP/syZR2yERewJoeIidM83f9UWb3BRm1FK/qYEFkiTOW\n" .
"dNs2O3pK8X0g8pUX4oFX3aqclVYuBgKCo9qm0gDoiu+aMG840LO8+b/pGR8lf6L3\n" .
"quB/TiEIdsyYkXDZqmrnNsYPP57i4XHXKgZPiP/RsDUDTdwiamh/5Dq7AoGBAJ7n\n" .
"qEi41QNYdcwVsnTHnXK3C/XQ3cBKaJqxG6KFIQNKcED9LL6FuNGXncVlo/vyqI1b\n" .
"+1WJOVLKKnuzWJ07s2MT3fDJT/SM/jM/MR0wNqBGyw6fhsBMkXhQCVDOLnrTTnni\n" .
"++i1ZOrjypQW2+I4192778e+WI3B5EpJMp3/xcxhAoGBAMWu5OaWe2bHcRQiQ9MF\n" .
"2G5YQe9w00SAxj6UxcbrQjV2Zi2TaDEdNHLul8AeiKn8ZzQ899+DJ2QOE5L++vig\n" .
"gxTRkZ+QyinHrXroX+8RJaf80s+TRMeJTOorp03IqpF+aIkkVtxFkR3aInUO8+4A\n" .
"dbKM8rxpx3PYjndtT63VInWu\n" .
"-----END PRIVATE KEY-----\n";

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// 1. Generate JWT
$header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
$now = time();
$payload = json_encode([
    'iss' => $client_email,
    'scope' => 'https://www.googleapis.com/auth/calendar.readonly',
    'aud' => 'https://oauth2.googleapis.com/token',
    'exp' => $now + 3600,
    'iat' => $now
]);

$base64UrlHeader = base64url_encode($header);
$base64UrlPayload = base64url_encode($payload);

$signature = '';
openssl_sign($base64UrlHeader . "." . $base64UrlPayload, $signature, $private_key, OPENSSL_ALGO_SHA256);
$base64UrlSignature = base64url_encode($signature);
$jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

// 2. Exchange JWT for Access Token
$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion' => $jwt
]));
$response = curl_exec($ch);
curl_close($ch);

$token_data = json_decode($response, true);
if (!isset($token_data['access_token'])) {
    echo json_encode([]);
    exit;
}
$access_token = $token_data['access_token'];

// 3. Fetch Events from Calendar
$timeMin = date('Y-m-d\T00:00:00\Z', strtotime($dateStr));
$timeMax = date('Y-m-d\T23:59:59\Z', strtotime($dateStr));
$url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendar_id) . "/events?timeMin=" . urlencode($timeMin) . "&timeMax=" . urlencode($timeMax) . "&singleEvents=true";

$ch2 = curl_init($url);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $access_token
]);
$events_response = curl_exec($ch2);
curl_close($ch2);

$events_data = json_decode($events_response, true);

// 4. Format to match what frontend expects
$formatted_events = [];
if (isset($events_data['items'])) {
    foreach ($events_data['items'] as $item) {
        if (isset($item['start']['dateTime']) && isset($item['end']['dateTime'])) {
            $formatted_events[] = [
                'start' => ['dateTime' => $item['start']['dateTime']],
                'end' => ['dateTime' => $item['end']['dateTime']]
            ];
        }
    }
}

echo json_encode($formatted_events);
?>
