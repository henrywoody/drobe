SELECT
	outerwear.*
FROM
	outerwear
INNER JOIN
	(SELECT
		*
	FROM
		outerwear_outerwear_join
	WHERE
		a_outerwear_id = $1 OR b_outerwear_id = $1
	) AS joined_outerwear
ON
	outerwear.id = ANY(ARRAY[joined_outerwear.a_outerwear_id, joined_outerwear.b_outerwear_id])
WHERE
	outerwear.id != $1 AND (outerwear.min_temp <= $2 OR outerwear.min_temp IS NULL) AND (outerwear.max_temp >= $2 OR outerwear.max_temp IS NULL)