$(function() {
    // version
    var manifest = chrome.runtime.getManifest();
    $('.version').html(manifest.version);

    // get coords user

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function addFormatLog(text, type) {
        var d = new Date();
        datetext = d.toTimeString();
        datetext = datetext.split(' ')[0];
        if (type == 'success') {
            return '<span class="console-success">[' + datetext + '] ' + text + '</span>';
        } else if (type == 'error') {
            return '<span class="console-error">[' + datetext + '] ' + text + '</span>';
        } else {
            return '[' + datetext + '] ' + text;
        }
    }

    function success(pos) {
        var accuracy = pos.coords.accuracy; // meters
        var lat = pos.coords.latitude;
        var long = pos.coords.longitude;
        $('#cgps-x').val(lat);
        $('#cgps-y').val(long);
        $('#cgps-console').prepend('<br />');
        $('#cgps-console').prepend(addFormatLog('coordonnées trouvées (précision : ' + accuracy + ' mètres)', ''));
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'https://api-adresse.data.gouv.fr/reverse/?lon=' + long + '&lat=' + lat,
            success: function(data) {
                if (data.features[0] != undefined) {
                    $('#cgps-address').val(data.features[0].properties.label);
                    $('#cgps-console').prepend('<br />');
                    $('#cgps-console').prepend(addFormatLog('adresse trouvée', ''));
                    $('#cgps-console').prepend('<br />');
                    $('#cgps-console').prepend(addFormatLog('requête réussie !', 'success'));
                } else {
                    $('#cgps-address').val('');
                    $('#cgps-y').val('');
                    $('#cgps-x').val('');
                    $('#cgps-console').prepend('<br />');
                    $('#cgps-console').prepend(addFormatLog('échec de la géolocalisation', 'error'));                    
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#cgps-console').prepend('<br />');
                $('#cgps-console').prepend(addFormatLog(errorThrown, 'error'));
            }
        });
        $('.loading').hide();
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        $('.loading').hide();
    };

    $('#btn-get-position').on('click', function() {
        $('.loading').show();
        navigator.geolocation.getCurrentPosition(success, error, options);
    });

    $('#btn-get-address').on('click', function() {
        var lat = $('#cgps-x').val().trim();
        var long = $('#cgps-y').val().trim();
        if ((lat > 0) && (long > 0)) {
            $('.loading').show();
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'https://api-adresse.data.gouv.fr/reverse/?lon=' + long + '&lat=' + lat,
                success: function(data) {
                    if (data.features[0] != undefined) {
                        $('#cgps-address').val(data.features[0].properties.label);
                        $('#cgps-console').prepend('<br />');
                        $('#cgps-console').prepend(addFormatLog('adresse trouvée', ''));
                        $('#cgps-console').prepend('<br />');
                        $('#cgps-console').prepend(addFormatLog('requête réussie !', 'success'));
                    } else {
                        $('#cgps-address').val('');
                        $('#cgps-console').prepend('<br />');
                        $('#cgps-console').prepend(addFormatLog('adresse non trouvée', 'error'));
                    }
                    $('.loading').hide();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#cgps-console').prepend('<br />');
                    $('#cgps-console').prepend(addFormatLog(errorThrown, 'error'));
                    $('.loading').hide();
                }
            });
        } else {
            $('#cgps-address').val('');
            $('#cgps-console').prepend('<br />');
            $('#cgps-console').prepend(addFormatLog('coordonnées non trouvées', 'error'));
        }
    });

    $('#btn-get-coords').on('click', function() {
        var address = $('#cgps-address').val().trim();
        if (address != '') {
            $('.loading').show();
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(address),
                success: function(data) {
                    if (data.features[0] != undefined) {
                        var newCoords = data.features[0].geometry.coordinates;
                        $('#cgps-y').val(newCoords[0]);
                        $('#cgps-x').val(newCoords[1]);
                        $('#cgps-console').prepend('<br />');
                        $('#cgps-console').prepend(addFormatLog('coordonnées trouvées', ''));
                        $('#cgps-console').prepend('<br />');
                        $('#cgps-console').prepend(addFormatLog('requête réussie !', 'success'));
                    } else {
                        $('#cgps-y').val('');
                        $('#cgps-x').val('');
                        $('#cgps-console').prepend('<br />');
                        $('#cgps-console').prepend(addFormatLog('coordonnées non trouvées', 'error'));
                    }
                    $('.loading').hide();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#cgps-console').prepend('<br />');
                    $('#cgps-console').prepend(addFormatLog(errorThrown, 'error'));
                    $('.loading').hide();
                }
            });
        } else {
            $('#cgps-y').val('');
            $('#cgps-x').val('');
            $('#cgps-console').prepend('<br />');
            $('#cgps-console').prepend(addFormatLog('adresse non trouvée', 'error'));
        }
    });
});
