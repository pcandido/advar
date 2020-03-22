import { from, range, fillOf, empty } from '../dist-browser/sparray.js';

function calc() {
    let data;

    const factory = $('#factory-selector [name=factory]:checked').val();

    $('.factory').hide();
    $('.factory.' + factory).show();

    try {
        switch (factory) {
            case 'from':
                data = eval(`from(${$('#from-elements').val()})`);
                break;
            case 'range':
                data = eval(`range(
                        ${$('#range-start').val() || undefined},
                        ${$('#range-end').val() || undefined},
                        ${$('#range-step').val() || undefined}
                    )`);
                break;
            case 'fillOf':
                data = eval(`fillOf(
                    ${$('#fillOf-length').val()},
                    ${$('#fillOf-value').val()}
                )`);
                break;
            case 'empty':
                data = eval(`empty()`);
                break;
        }
        $('#main .block-result').text(data.toString());
        $('#main .block-error').hide();
    } catch (e) {
        $('#main .block-error').text(e).show();
        return;
    }

    $('.block.auto').each((i, a) => {
        a = $(a);
        try {
            const codeEl = a
                .find('.block-body code')
                .clone();

            codeEl.find('input').each((i, b) => {
                b = $(b);
                b.replaceWith(b.val());
            });

            codeEl.find('textarea').each((i, b) => {
                b = $(b);
                b.replaceWith(b.val());
            });

            const code = codeEl.text();

            const res = eval(code);

            a.find('.block-result').empty();
            if (res === null) {
                a.find('.block-result').html('<span class="not-valid">null</span>');
            } else if (typeof res === 'undefined') {
                a.find('.block-result').html('<span class="not-valid">undefined</span>');
            } else {
                a.find('.block-result').text(res.toString());
            }

            a.find('.block-error').hide();
        } catch (e) {
            a.find('.block-error').text(e).show();
        }

    });
}

$(() => {
    $('textarea').each((i, a) => $(a).val($(a).data('value')));
    $('input, textarea').on('input', calc);
    calc();
});
