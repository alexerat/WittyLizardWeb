<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ConfirmationStaus
 *
 * @ORM\Table(name="Users.Confirmation_Staus", uniqueConstraints={@ORM\UniqueConstraint(name="Status_ID_UNIQUE", columns={"Status_ID"})})
 * @ORM\Entity
 */
class ConfirmationStaus
{
    /**
     * @var string
     *
     * @ORM\Column(name="Status_Desc", type="string", length=45, nullable=true)
     */
    private $statusDesc;

    /**
     * @var integer
     *
     * @ORM\Column(name="Status_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $statusId;



    /**
     * Set statusDesc
     *
     * @param string $statusDesc
     *
     * @return ConfirmationStaus
     */
    public function setStatusDesc($statusDesc)
    {
        $this->statusDesc = $statusDesc;

        return $this;
    }

    /**
     * Get statusDesc
     *
     * @return string
     */
    public function getStatusDesc()
    {
        return $this->statusDesc;
    }

    /**
     * Get statusId
     *
     * @return integer
     */
    public function getStatusId()
    {
        return $this->statusId;
    }
}
