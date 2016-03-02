<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * StyleGroups
 *
 * @ORM\Table(name="Users.Style_Groups")
 * @ORM\Entity
 */
class StyleGroups
{
    /**
     * @var string
     *
     * @ORM\Column(name="Style_Params", type="string", length=45, nullable=false)
     */
    private $styleParams;

    /**
     * @var integer
     *
     * @ORM\Column(name="Style_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $styleId;

    /**
     * Constructor
     */
    public function __construct()
    {
    }


    /**
     * Set styleParams
     *
     * @param string $styleParams
     *
     * @return StyleGroups
     */
    public function setStyleParams($styleParams)
    {
        $this->styleParams = $styleParams;

        return $this;
    }

    /**
     * Get styleParams
     *
     * @return string
     */
    public function getStyleParams()
    {
        return $this->styleParams;
    }

    /**
     * Get styleId
     *
     * @return integer
     */
    public function getStyleId()
    {
        return $this->styleId;
    }
}
