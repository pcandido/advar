import { from } from '../dist-browser/sparray.js';

function calc() {
    let data;

    try {
        data = eval(`from(${$('#sp').val()})`);
        $('#main block-result').text(data.toString());
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

            const code = codeEl.text();

            const res = eval(code);

            a.find('.block-result').text(res.toString());
            a.find('.block-error').hide();
        } catch (e) {
            a.find('.block-error').text(e).show();
        }

    });
}

$(() => {
    $('input').on('input', calc);
    calc();
});
