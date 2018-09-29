SELECT
	valid_pants.*
FROM
	(SELECT
		*
	FROM
		pants
	WHERE
		pants.user_id = $1 AND (pants.min_temp <= $2 OR pants.min_temp IS NULL) AND (pants.max_temp >= $2 OR pants.max_temp IS NULL)
	) AS valid_pants
INNER JOIN
	(SELECT
		shirt_joined_pants.pants_id
	FROM
		(SELECT
			pants_id
		FROM
			shirt_pants_join
		WHERE
			shirt_id = $3
		) AS shirt_joined_pants
	INNER JOIN
		(SELECT
			pants_id
		FROM
			pants_outerwear_join
		WHERE
			outerwear_id = ANY($4)
		GROUP BY
			pants_id
		HAVING
			COUNT(pants_id) = $5
		) AS outerwear_joined_pants
	ON
		shirt_joined_pants.pants_id = outerwear_joined_pants.pants_id
	) AS possible_pants
ON
	valid_pants.id = possible_pants.pants_id